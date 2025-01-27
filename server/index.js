const express = require('express');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const uri = process.env.URI;
const PORT = process.env.PORT || 8000;

const app = express();


/*
// Add headers before the routes are defined
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'https://playpal-green.vercel.app');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

/*
app.use(cors({
  origin: 'https://playpal-green.vercel.app'
}));
*/
app.use(cors());

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', function (req, res,next) {
  res.json('Hello to my app');
});

/************************Sign up ************** */
app.post('/signup', async (req, res, next) => {
  const { email, password } = req.body;
  const uniqueUserId = uuidv4();
  const encryptedPassword = await bcrypt.hash(password, 10); // Changed the number of bcrypt rounds to 10

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('playpal-data');
    const users = database.collection('users');
    const registeredUser = await users.findOne({ email }); //checking if user already exsist!

    if (registeredUser) {
      return res.status(409).send('The user account already exists. Please proceed to login.');
    }

    const filteredEmail = email.toLowerCase();
    const data = {
      user_id: uniqueUserId,
      email: filteredEmail,
      hashed_password: encryptedPassword,
      //this is second method to make matches an array in db
      //matches: [],
    };

    const newUser = await users.insertOne(data);

    const token = jwt.sign({ userId: newUser.insertedId }, filteredEmail, {
      expiresIn: '12h',
    });

    res.status(201).json({ token, userId: uniqueUserId });
  } catch (err) {
    console.error(err); // Log the error to the console
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});

/************************LOGIN ************** */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('playpal-data');
    const users = database.collection('users');
    const user = await users.findOne({ email }); // Retrieve the user

    if (!user) {
      // User does not exist, return an error message
      return res.status(404).send('User does not exist. Please proceed to sign up.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

    if (!isPasswordValid) {
      // Password is incorrect, return an error message
      return res.status(401).send('Incorrect password. Please try again.');
    }

    // Password is correct, generate and send the authentication token
    const token = jwt.sign({ userId: user.user_id }, email, {
      expiresIn: '12h',
    });

    res.status(200).json({ token, userId: user.user_id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});

/************************LOGIN ************** 
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('playpal-data');
    const users = database.collection('users');
    const user = await users.findOne({ email }); // Retrieve the user

    if (!user) {
      // User does not exist, return an error message
      return res.status(404).send('User does not exist. Please proceed to sign up.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

    if (!isPasswordValid) {
      // Password is incorrect, return an error message
      return res.status(401).send('Incorrect password. Please try again.');
    }

    const isAdmin = user.isAdmin; // Assuming you have an 'isAdmin' property in your user data

    // Password is correct, generate and send the authentication token
    const token = jwt.sign({ userId: user.user_id, isAdmin }, email, {
      expiresIn: '12h',
    });

    res.status(200).json({ token, userId: user.user_id, isAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error!!!!!!! Un expected');
  } finally {
    await client.close();
  }
});
*/
/************************Get current user data ************** */

app.get('/user', async (req, res) => {
  const client = new MongoClient(uri);
  const userId = req.query.userId;

  // console.log("i received userId" , userId)

  try {
    await client.connect();
    const database = client.db('playpal-data');
    const users = database.collection('users');
    const query = { user_id: userId };
    const userData = await users.findOne(query);

    //this is one way to store matches as an array in database
    //as matches is empty array and not getting input from client side, so better to define it server side as an array
    if (!Array.isArray(userData.matches)) userData.matches = [];

    res.send(userData);   // sending response of 'userdata' as an objec
    //console.log("this is user data" , userData)

  } finally {
    await client.close();
  }
});

/************************ ADD MATCH ************** */
app.put('/addmatch', async (req, res) => {
  const client = new MongoClient(uri);
  const { userId, matchedUserId } = req.body;

  try {
    await client.connect();
    const database = client.db('playpal-data');
    const users = database.collection('users');
    const query = { user_id: userId };
    const updateDocument = {
      $push: { matches: { user_id: matchedUserId } }
    };

    const result = await users.updateOne(query, updateDocument);

    if (result.modifiedCount === 1) {
      // Match added successfully, retrieve the updated user document
      const updatedUser = await users.findOne(query);
      res.send(updatedUser);
    } else {
      res.status(500).send('Failed to add match.');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred.');
  } finally {
    await client.close();
  }
});


/************************Get all users ************** */
app.get('/users', async (req, res) => {
  const client = new MongoClient(uri);
  const userIds = JSON.parse(req.query.userIds)

  // console.log("userIds are :" , userIds)
  try {
    await client.connect()
    const database = client.db('playpal-data')
    const users = database.collection('users')

    const pipeline =
      [
        {
          '$match': {
            'user_id': {
              '$in': userIds
            }
          }
        }
      ]

    const foundUsers = await users.aggregate(pipeline).toArray()
    // console.log("this is found user:" ,foundUsers);
    res.send(foundUsers);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(`An error occurred: ${error.message}`);
  } finally {
    await client.close();
  }
});

/************************Get user data for profile page**************/
app.get('/profiledata/:userId', async (req, res) => {
  const client = new MongoClient(uri);
  const userId = req.params.userId;

  try {
    await client.connect();
    const database = client.db('playpal-data');
    const users = database.collection('users');
    const query = { user_id: userId };
    const userData = await users.findOne(query);

    if (!userData) {
      return res.status(404).send('User not found');
    }

    res.send(userData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});

/************************Get matched users ************** */
app.get('/matched-users', async (req, res) => {
  const client = new MongoClient(uri);
  const userCity = req.query.city;

  // console.log("this is city value:", city);

  try {
    await client.connect();
    const database = client.db('playpal-data');
    const users = database.collection('users');

    const query = { show_matches: { $eq: userCity } };
    const listOfMatchedUsers = await users.find(query).toArray();
    res.json(listOfMatchedUsers);
    // console.log(" List of matched users are:",listOfMatchedUsers );
  } finally {
    await client.close();
  }
}
)

/************************GET PICTURES OF PROFILES************** */

// Create a multer instance with the desired configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Specify the destination folder for storing uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueFileName = uuidv4(); // Generate a unique filename for the uploaded file
    const fileExtension = path.extname(file.originalname); // Get the original file extension
    const updatedFileName = uniqueFileName + fileExtension; // Combine the unique filename and extension
    const updatedFilePath = updatedFileName.replace(/\\/g, '/'); // Replace backslashes with forward slashes
    cb(null, updatedFilePath); // Set the filename for the uploaded file
  },
});

// Create a multer upload instance
const upload = multer({ storage: storage });

/************************ PUT USER ************** */

app.put('/user', upload.single('picture'), async (req, res) => {
  const file = req.file;

  if (file) {
    const client = new MongoClient(uri);

    try {
      await client.connect();
      const database = client.db('playpal-data');
      const users = database.collection('users');

      const query = { user_id: req.body.user_id };
      const updateDocument = {
        $set: {
          picture: file.path, // Store the file path directly in the update document
          child_name: req.body.child_name,
          age: req.body.age,
          gender: req.body.gender,
          city: req.body.city,
          country: req.body.country,
          language: req.body.language,
          other_language: req.body.other_language,
          show_matches: req.body.show_matches,
          interest: req.body.interest,
          availability: req.body.availability,
          additional_info: req.body.additional_info,
        },
      };

      const newUser = await users.updateOne(query, updateDocument);
      res.send(newUser);
    } finally {
      await client.close();
    }
  } else {
    res.status(400).send({ message: 'No file uploaded' });
  }
});


/************************ Get Messages ************** */
app.get('/messages', async (req, res) => {
  const client = new MongoClient(uri);
  const { userId, correspondingUserId } = req.query;
  // console.log(" these are sender and receiver ids:" , userId, correspondingUserId);

  try {
    await client.connect();
    const database = client.db('playpal-data');
    const messages = database.collection('messages');
    const query = { from_userId: userId, to_userId: correspondingUserId }
    const chatMessages = await messages.find(query).toArray();

    //console.log("here are chat messages:" , chatMessages);

    res.send(chatMessages);
  } finally {
    await client.close();
  }
});

/************************ POST MESSAGES ************** */
app.post('/message', async (req, res) => {

  const client = new MongoClient(uri);
  const message = req.body.message;

  //console.log("message to be inserted is here:", message);

  try {
    await client.connect();
    const database = client.db('playpal-data');
    const messages = database.collection('messages');
    const newMessage = await messages.insertOne(message);
    res.send(newMessage);
  } finally {
    await client.close();
  }
});

/************************ Create Playdate ************
app.post('/create-playdate', async (req, res) => {
  const client = new MongoClient(uri); 
  const { userId, matchedUserId } = req.body;
  

  try {
    await client.connect();
    const database = client.db('playpal-data');
    const playdates = database.collection('playdates');
    const newPlaydate = {
      userId,
      matchedUserId,
      date: new Date(),
    };
    const result = await playdates.insertOne(newPlaydate);

   // console.log("this is result ", result);
   // console.log("this is insertedCount ", result.insertedCount);

    //if (result.insertedCount === 1) { // not working with this

      const insertedDate = await playdates.findOne(newPlaydate);
     // res.send(insertedDate);

    // console.log("this is insertedDate ", insertedDate);
      //console.log("this is newPlaydate ", newPlaydate);
      res.status(200).json(newPlaydate);
   
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});*/

/************************ Insert a  Playdate **************/

app.post('/playdate', async (req, res) => {
  const client = new MongoClient(uri);

  const { user_id, date, child_name, time, location } = req.body;

  try {
    await client.connect();
    const database = client.db('playpal-data');
    const playdates = database.collection('playdates');
    const newPlaydate = {
      user_id,
      date,
      child_name,
      time,
      location
    };


    const result = await playdates.insertOne(newPlaydate);


    //if (result.insertedCount === 1) {
    const insertedPlaydate = await playdates.findOne(newPlaydate);

    return res.status(200).json(insertedPlaydate);

    /* } else {
       return res.status(500).send('Failed to create playdate');
     }*/
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});

app.get('/scheduled-dates/:userId', async (req, res) => {
  const client = new MongoClient(uri);
  const userId = req.params.userId;

  try {
    await client.connect();
    const database = client.db('playpal-data');
    const playdates = database.collection('playdates');

    // Retrieve scheduled dates for the specified user ID
    const scheduledDates = await playdates.find({ user_id: userId }).toArray();

    res.json(scheduledDates);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});

app.listen(PORT, function () {
  console.log('Server listening on port ' + PORT);
});