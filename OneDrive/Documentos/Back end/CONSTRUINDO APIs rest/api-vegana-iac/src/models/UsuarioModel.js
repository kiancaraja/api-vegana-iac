// src/models/UsuarioModel.js

import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Garante que o email é único no banco
    },
    senha: {
        type: String,
        required: true,
    },
});

const UsuarioModel = mongoose.model('Usuario', usuarioSchema);

export default UsuarioModel;