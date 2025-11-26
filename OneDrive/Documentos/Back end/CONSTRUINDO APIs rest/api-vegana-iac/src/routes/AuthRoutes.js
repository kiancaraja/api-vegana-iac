import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UsuarioModel from '../models/UsuarioModel.js';
 // <-- CORRETO
 // <-- Ele usa o Model que acabamos de criar!

const router = express.Router();

// ------------------------------------------------
// ROTA 1: REGISTRO (/auth/registro)
// ------------------------------------------------
router.post('/registro', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const novoUsuario = new UsuarioModel({
            nome,
            email,
            senha: senhaHash,
        });

        await novoUsuario.save();
        
        res.status(201).json({ mensagem: 'Usuário registrado com sucesso!' });
    } catch (error) {
        if (error.code === 11000) { 
            return res.status(400).json({ mensagem: 'E-mail já cadastrado.' });
        }
        res.status(500).json({ mensagem: 'Erro no registro.', erro: error.message });
    }
});

// ------------------------------------------------
// ROTA 2: LOGIN (/auth/login)
// ------------------------------------------------
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const user = await UsuarioModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ mensagem: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({ mensagem: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
        }

        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } 
        );

        res.status(200).json({ mensagem: 'Login realizado com sucesso!', token });

    } catch (error) {
        res.status(500).json({ mensagem: 'Erro no login.', erro: error.message });
    }
});


export default router;