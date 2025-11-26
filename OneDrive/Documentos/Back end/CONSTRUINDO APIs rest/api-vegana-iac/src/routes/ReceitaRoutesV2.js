import ReceitaModel from '../models/ReceitaModel.js';
import { Router } from 'express';
import verifyToken from '../middlewares/verifyToken.js'; 

const router = Router();

router.get('/', async (req, res) => {
    try {
        const todasAsReceitas = await ReceitaModel.find({});
        res.status(200).json(todasAsReceitas);
    } catch (error) {
        console.error("Erro ao buscar receitas:", error);
        res.status(500).json({ mensagem: "Erro ao buscar receitas", erro: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;
        const receitaEncontrada = await ReceitaModel.findById(idBuscado);

        if (receitaEncontrada) {
            res.status(200).json(receitaEncontrada);
        } else {
            res.status(404).json({ mensagem: "Receita não encontrada com esse ID" });
        }
    } catch (error) {
        console.error("Erro ao buscar receita por ID:", error);
        res.status(500).json({ mensagem: "Erro ao buscar receita", erro: error.message });
    }
});

// ROTA 3: POST (CRIAR NOVA)
router.post('/', verifyToken,async (req, res) => {
    try {
        // Pega todos os dados do "corpo"
        const { titulo, ingredientes, modoDePreparo, tempoDePreparo } = req.body;

        // Cria um novo objeto de receita
        const novaReceita = new ReceitaModel({
            titulo,
            ingredientes,
            modoDePreparo,
            tempoDePreparo
        });

        // Salva no banco de dados
        const receitaSalva = await novaReceita.save();
        
        // Responde com o item novo
        res.status(201).json(receitaSalva); // 201 = "Criado com Sucesso"

    } catch (error) {
        console.error("Erro ao salvar receita:", error);
        res.status(500).json({ mensagem: "Erro ao salvar receita", erro: error.message });
    }
});

// ROTA 4: PATCH /:id (ATUALIZAR POR ID)
router.patch('/:id', async (req, res) => {
    try {
        const idParaAtualizar = req.params.id;
        const dadosNovos = req.body;

        const receitaAtualizada = await ReceitaModel.findByIdAndUpdate(
            idParaAtualizar, 
            dadosNovos, 
            { new: true } // Devolve o documento JÁ ATUALIZADO
        );

        if (receitaAtualizada) {
            res.status(200).json(receitaAtualizada);
        } else {
            res.status(404).json({ mensagem: "Receita não encontrada, nada foi atualizado." });
        }
    } catch (error) {
        console.error("Erro ao atualizar receita:", error);
        res.status(500).json({ mensagem: "Erro ao atualizar receita", erro: error.message });
    }
});

// ROTA 5: DELETE /:id (DELETAR POR ID)
router.delete('/:id', async (req, res) => {
    try {
        const idParaDeletar = req.params.id;
        const receitaDeletada = await ReceitaModel.findByIdAndDelete(idParaDeletar);

        if (receitaDeletada) {
            res.status(200).json({ mensagem: "Receita deletada com sucesso!" });
        } else {
            res.status(404).json({ mensagem: "Receita não encontrada, nada foi deletado." });
        }
    } catch (error) {
        console.error("Erro ao deletar receita:", error);
        res.status(500).json({ mensagem: "Erro ao deletar receita", erro: error.message });
    }
});
export default router;