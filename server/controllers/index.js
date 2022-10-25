const models = require('../models');

const { Dog } = models;
const { Cat } = models;

const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};

const defaultDogData = {
  name: 'unknown',
  breed: 'unknown',
  age: 0,
};

let lastAdded = new Cat(defaultData);

// TypeError: Dog is not a constructor
let lastAddedDog = new Dog(defaultDogData);

const hostIndex = (req, res) => {
  res.render('index', {
    currentName: lastAdded.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

const hostPage1 = async (req, res) => {
  try {
    const docs = await Cat.find({}).lean().exec();

    return res.render('page1', { cats: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to find cats' });
  }
};

const hostPage2 = (req, res) => {
  res.render('page2');
};

const hostPage3 = (req, res) => {
  res.render('page3');
};

const hostPage4 = async (req, res) => {
  try {
    const docs = await Dog.find({}).lean().exec();

    return res.render('page4', { dogs: docs });
  } catch (err) {
    console.log(err);
    return res.json(500).json({ error: 'failed to find dogs' });
  }
};

const getNameCat = (req, res) => res.json({ name: lastAdded.name });

const setNameCat = async (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    return res.status(400).json({ error: 'firstname, lastname and beds are all required' });
  }

  const catData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    bedsOwned: req.body.beds,
  };

  const newCat = new Cat(catData);

  try {
    await newCat.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to create cat' });
  }

  lastAdded = newCat;
  return res.json({
    name: lastAdded.name,
    beds: lastAdded.bedsOwned,
  });
};

const getNameDog = (req, res) => res.json({ name: lastAddedDog.name });

const setNameDog = async (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.breed || !req.body.age) {
    return res.status(400).json({ error: 'firstname, lastname, breed amd age are all required' });
  }

  const dogData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    age: req.body.age,
    breed: `${req.body.breed}`,
  };

  const newDog = new Dog(dogData);

  try {
    await newDog.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to create dog' });
  }

  lastAddedDog = newDog;
  return res.json({
    name: lastAddedDog.name,
    age: lastAddedDog.age,
    breed: lastAddedDog.breed
  });
};

// ONLY WORKS FOR 1 AND CATS
const searchNameCat = async (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  let doc;
  try {
    doc = await Cat.findOne({ name: req.query.name }).exec();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }

  if (!doc) {
    return res.json({ error: 'No animal found' });
  }

  return res.json({ name: doc.name, beds: doc.bedsOwned });
};

const searchNameDog = async (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  let doc;
  try {
    doc = await Dog.findOne({ name: req.query.name }).exec();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }

  if (!doc) {
    return res.json({ error: 'No dog was found' });
  }

  doc.age++;

  try {
    await doc.save();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to increase age' });
  }

  return res.json({ name: doc.name, age: doc.age, breed: doc.breed });
};

const updateLastCat = (req, res) => {
  // First we will update the number of bedsOwned.
  lastAdded.bedsOwned++;

  const savePromise = lastAdded.save();

  // If we successfully save/update them in the database, send back the cat's info.
  savePromise.then(() => res.json({
    name: lastAdded.name,
    beds: lastAdded.bedsOwned,
  }));

  // If something goes wrong saving to the database, log the error and send a message to the client.
  savePromise.catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};

const updateLastDog = (req, res) => {
  // First we will update the number of bedsOwned.
  lastAddedDog.age++;

  const savePromise = lastAddedDog.save();

  // If we successfully save/update them in the database, send back the cat's info.
  savePromise.then(() => res.json({
    name: lastAddedDog.name,
    age: lastAddedDog.age,
  }));

  // If something goes wrong saving to the database, log the error and send a message to the client.
  savePromise.catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};

// A function to send back the 404 page.
const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

// export the relevant public controller functions
module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  getName: getNameCat,
  setName: setNameCat,
  getNameDog,
  setNameDog,
  updateLastDog,
  updateLastCat,
  searchName: searchNameCat,
  hostPage4,
  searchNameDog,
  notFound,
};
