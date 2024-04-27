
const express =require('express');
const Pool =require('pg').Pool;
const path =require('path');
const ejs =require('ejs');
const bodyParser = require('body-parser');
// const _dirname = dirname(fileURLToPath(import.meta.url));
const port = 8000;

const app = express();

// Create a new Pool instance
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: 'Abcd@123',
  port: 5432, 
});

pool.connect((err,client,release)=>{
  if(err)
  {
    return console.error('error in connection');
  }
  client.query('SELECT NOW()',(err,result)=>{
    release();
    if(err){
      return console.error('Error executing query');
    }
    console.log("connected");
  })
});

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use('/static',express.static('static'))
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.get("/",async(req,res)=>{

  const data = await pool.query(`SELECT * FROM sell`);
  res.render('index', {data: data.rows});
});

app.get("/login",async(req,res)=>{
    const data = await pool.query(`SELECT * FROM login`);

    res.render('login', {data: data.rows});
  });
  
  app.post("/submit",async(req,res)=>{
    const { email , password}= req.body;
    try{
      const result = await pool.query(`INSERT INTO login ( email,password) VALUES ($1 , $2 ) RETURNING *`,[ email , password]);
      const uemail = await pool.query(`SELECT password FROM signup WHERE email = $1`,[email]);
      console.log(uemail.rows[0].password);
      console.log(req.body["password"]);
      if(uemail.rows[0].password === req.body["password"] )
      {
        res.redirect('/');
      }
      else
      {
        res.send("password is incorrect");
        // res.redirect('/');
      }
    }
    catch(error)
    {
      res.send("please create your account");
      // console.log("error in adding todo");
      // console.log(error);
      // res.status(500).json({error: 'internal server error'})
    }
  })
  app.get("/sell",async(req,res)=>{
    const dataa = await pool.query(`SELECT * FROM sell`);

    res.render('sell');
    // res.render('sell');

  });
  app.post("/done",async(req,res)=>{
    const {bookname, bookemail , bookpassword ,bookimage , price,oprice ,dec,phone}= req.body;
    
      const result = await pool.query(`INSERT INTO sell ( bookname, bookemail , bookpassword ,bookimage , price,oprice ,dec,phone) VALUES ($1 , $2, $3, $4, $5, $6 ,$7 ,$8) RETURNING *`,[bookname, bookemail , bookpassword ,bookimage , price,oprice ,dec,phone]);
     
      
    res.redirect("/");
   
  })
  app.get("/signup",async(req,res)=>{
    
    res.render('signup');
  });
  
  app.post("/signup",async(req,res)=>{
    const {name, email , phone , password ,cpassword }= req.body;
    try{
      const result = await pool.query(`INSERT INTO signup ( name, email , phone , password ,cpassword ) VALUES ($1 , $2, $3, $4, $5) RETURNING *`,[name, email , phone , password ,cpassword ]);
      
      if(req.body["password"] === req.body["cpassword"])
      {

        res.redirect("/");
      }
      else
      {
        res.send("password and conform password is not match");
      }
    }
    catch(error)
    {
      console.log("error in adding data");
      console.log(error);
      res.status(500).json({error: 'internal server error'})
    }
  })

  app.get("/yourbooks",async(req,res)=>{
    const {email , password}= req.body;
    // const data = await pool.query(`SELECT * FROM sell WHERE email = `)
    // res.redirect("/");
    const data = await pool.query(`SELECT * FROM sell WHERE bookemail = $1`,[req.body["email"]]);

    console.log(email);
    res.render('yourbooks');
  });
  
  // app.get("/books",async(req,res)=>{
  //   const data = await pool.query(`SELECT * FROM sell WHERE bookemail = $1`,[req.body["email"]]);

  //   res.render('/books',{data: data.rows});
  // })

  app.post("/books",async(req,res)=>{
    const {email ,password }= req.body;
    console.log(req.body["email"]);
    const data = await pool.query(`SELECT * FROM sell WHERE bookemail = $1`,[req.body["email"]]);
    await pool.query(`SELECT bookpassword FROM sell WHERE bookemail = $1 `,[req.body["email"]], function (err, result) {
      console.log(result.rows[0].bookpassword);
      console.log(req.body["password"]);
      if(req.body["password"] === result.rows[0].bookpassword)
      {
          // res.redirect('/books');
          res.render('books',{data: data.rows});
        }
           else
      {
        res.send("password and conform password is not match");
      }
    });
  });
   

  app.get("/buyy",async(req,res)=>{
    res.render('buyy');
  })
  app.post("/order",async(req,res)=>{
    
    res.redirect("/");
   
  })
  


  app.get('/delete/:id',async(req,res)=>{
    const id= req.params.id;
    await pool.query(`DELETE FROM sell WHERE id = $1`,[id]);
    res.redirect('/');
  })
  
app.listen(port,()=>{
  console.log(`server is listen on port ${port}` );
});
