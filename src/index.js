const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('helmet');

require('./db/connection');
const dotenv = require('dotenv');
dotenv.config();


const userRoutes = require('./routes/user');
const pageRoutes = require('./routes/pages');
const buyerRoutes = require('./routes/buyer');
const invoiceRoutes = require('./routes/invoice');
const wallerRoutes = require('./routes/wallet')
const app = express();


app.use(express.json());
app.use(cors());
app.use(morgan('combined'));
app.use(helmet());


app.use('/api/user',userRoutes);
app.use('/api',pageRoutes);
app.use('/api',buyerRoutes);
app.use('/api',invoiceRoutes);
app.use('/api',wallerRoutes);



const port = process.env.PORT || 8080;
app.listen(port,()=>{
    console.log('Listening on port '+port);
})


