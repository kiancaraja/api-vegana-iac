// src/middlewares/verifyToken.js

import jwt from 'jsonwebtoken';

// Esta função é o nosso "segurança"
const verifyToken = (req, res, next) => {
    // 1. Tenta encontrar o token no cabeçalho (header) 'Authorization'
    const authHeader = req.headers['authorization'];
    
    // O token geralmente vem no formato: 'Bearer SEU_TOKEN_AQUI'
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Se não houver token, retorna erro
    if (!token) {
        // 401: Não Autenticado
        return res.status(401).json({ msg: 'Acesso negado! Token não fornecido.' });
    }

    try {
        // 3. Verifica se o token é válido usando a chave secreta
        const secret = process.env.JWT_SECRET;
        jwt.verify(token, secret); // Se falhar, vai para o catch
        
        // 4. Se for válido, deixa a requisição seguir em frente
        next();

    } catch (error) {
        // 5. Se a verificação falhar (token expirado ou falsificado)
        // 403: Proibido (Token existe, mas é inválido)
        res.status(403).json({ msg: 'Token inválido ou expirado.' });
    }
};

export default verifyToken;