# main.tf

# Define o provedor (qual serviço de cloud vamos usar)
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configura o provedor AWS (usa a região que definimos no aws configure)
provider "aws" {
  region = "us-east-1" 
}
# Recurso: Cria um Bucket S3 para o projeto
resource "aws_s3_bucket" "api_vegana_bucket" {
  # O nome do bucket deve ser globalmente único na AWS
  # Use um nome que inclua seu username para garantir unicidade
  bucket = "api-vegana-terceira-kiancaraja" 
  
  tags = {
    Name        = "API Vegana Bucket"
    Environment = "Dev"
    Owner       = "ElieneMS"
  }
}

# Bloco 1: (Moderno) Define o JSON da política para acesso de leitura pública
data "aws_iam_policy_document" "allow_public_read" {
  statement {
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions = [
      "s3:GetObject",
    ]
    resources = [
      "${aws_s3_bucket.api_vegana_bucket.arn}/*",
    ]
  }
}

# Bloco 2: Aplica o JSON da política ao bucket
resource "aws_s3_bucket_policy" "api_vegana_policy" {
  bucket = aws_s3_bucket.api_vegana_bucket.id
  policy = data.aws_iam_policy_document.allow_public_read.json
}

# Define o cluster ECS onde a API será executada
resource "aws_ecs_cluster" "api_vegana_cluster" {
  name = "api-vegana-cluster-dev"
  
  tags = {
    Name = "API Vegana Cluster"
  }
}

# Cria a Rede Virtual Privada (VPC)
resource "aws_vpc" "api_vegana_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "api-vegana-vpc"
  }
}

# Cria uma Sub-rede pública
resource "aws_subnet" "api_vegana_subnet_public" {
  vpc_id                  = aws_vpc.api_vegana_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true # Essencial para o Fargate acessar a internet
  availability_zone       = "us-east-1a" # Primeira Zona de Disponibilidade

  tags = {
    Name = "api-vegana-subnet-public"
  }
}

# Conecta a VPC à internet
resource "aws_internet_gateway" "api_vegana_igw" {
  vpc_id = aws_vpc.api_vegana_vpc.id

  tags = {
    Name = "api-vegana-igw"
  }
}

# Define a rota para a internet
resource "aws_route_table" "api_vegana_route_table" {
  vpc_id = aws_vpc.api_vegana_vpc.id

  route {
    cidr_block = "0.0.0.0/0" # Todo tráfego de saída
    gateway_id = aws_internet_gateway.api_vegana_igw.id
  }

  tags = {
    Name = "api-vegana-route-table"
  }
}

# Associa a Tabela de Rotas à Sub-rede pública
resource "aws_route_table_association" "api_vegana_route_assoc" {
  subnet_id      = aws_subnet.api_vegana_subnet_public.id
  route_table_id = aws_route_table.api_vegana_route_table.id
}

# Cria o Security Group (Firewall) para permitir tráfego HTTP
resource "aws_security_group" "api_vegana_sg" {
  name        = "api-vegana-sg"
  description = "Permite acesso HTTP na porta 80"
  vpc_id      = aws_vpc.api_vegana_vpc.id

  # Regra de entrada: Permite acesso HTTP (porta 3000) de qualquer lugar (0.0.0.0/0)
  # CÓDIGO INGRESS (Entrada) - ALVO: aws_security_group.api_vegana_sg
  ingress {
    description = "HTTP access"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # NOVO BLOCO: Permite o acesso à porta 80
  ingress {
    description = "API Access Port"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Regra de saída: Permite que a API saia (para o MongoDB Atlas)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "api-vegana-sg"
  }
}

# Define como o seu container deve rodar no Fargate
resource "aws_ecs_task_definition" "api_vegana_task" {
  family                   = "api-vegana-task-family"
  cpu                      = "256"
  memory                   = "512"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn # Referencia a Role IAM que criamos
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn # Usamos a mesma Role para Task e Execution (simples)

  container_definitions = jsonencode([
    {
      name      = "api-vegana-container"
      image     = "057149785393.dkr.ecr_repository_url
      us-east-1.amazonaws.com/api-vegana-terceira:latest" # SEU ENDEREÇO ECR CORRETO
      cpu       = 256
      memory    = 512
      essential = true
      portMappings = [
        {
          containerPort = 3000 # A porta que a API Vegana usa
          hostPort      = 3000
        }
      ]
    }
  ])
}

# Define o serviço que mantém 1 cópia da sua API rodando no Cluster
resource "aws_ecs_service" "api_vegana_service" {
  name            = "api-vegana-service-dev"
  cluster         = aws_ecs_cluster.api_vegana_cluster.name
  task_definition = aws_ecs_task_definition.api_vegana_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.api_vegana_subnet_public.id] # Usa a Sub-rede que você criou
    security_groups  = [aws_security_group.api_vegana_sg.id]     # Usa o Firewall que você criou
    assign_public_ip = true                                      # Essencial para acessar via internet
  }

  depends_on = [aws_internet_gateway.api_vegana_igw]

  tags = {
    Name = "api-vegana-service"
  }
}

# Define que o ECS pode assumir esta Role
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecs-task-execution-role-vegana"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      },
    ]
  })
}

# Anexa a política gerenciada da AWS que dá as permissões necessárias
resource "aws_iam_role_policy_attachment" "ecs_task_exec_attach" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}