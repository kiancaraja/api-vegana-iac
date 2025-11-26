import mongoose from 'mongoose';


const receitaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  ingredientes: {
    type: [String],
    required: true
  },
  modoDePreparo: {
    type: String,
    required: true 
  },
  tempoDePreparo: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
    }
    });

    const ReceitaModel = mongoose.model('Receita', receitaSchema);

    // ROTA PATCH /:id (ATUALIZA UMA RECEITA PELO ID)

export default ReceitaModel;