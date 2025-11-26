// app.js (VERSÃO FINAL - SUBSTITUA O CONTEÚDO TODO)

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importar Rotas (Usando os nomes corrigidos)
import receitaRoutes from './src/routes/ReceitaRoutesV2.js';
import authRoutes from './src/routes/AuthRoutes.js';

// 1. CONFIGURAÇÃO DO DOTENV
dotenv.config();

// 2. CRIAR O APP EXPRESS
const app = express();

// 3. MIDDLEWARE (Lê JSON - TEM QUE VIR ANTES DAS ROTAS)
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// 4. CONEXÃO COM O BANCO DE DADOS
const mongoUrl = process.env.DATABASE_URL;
mongoose.connect(mongoUrl);
const db = mongoose.connection;
db.on('error', (error) => console.error('Erro ao conectar no Mongo:', error));
db.once('open', () => console.log('Conectado ao MongoDB com sucesso! 🌴'));

// 5. REGISTO DE ROTAS
app.use('/receitas', receitaRoutes);
app.use('/auth', authRoutes);

// 6. SUBIR O SERVIDOR
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});