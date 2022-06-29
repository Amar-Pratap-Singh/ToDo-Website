//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



mongoose.connect("mongodb+srv://admin-amar:test123@cluster0.ywdjzcl.mongodb.net/todolistdb")
const itemsSchema = mongoose.Schema({
    name: String
});

const listSchema = mongoose.Schema({
  name: String,
  item: [itemsSchema]
});

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to the todo List"
});

const item2 = new Item({
  name: "Hit + to  add new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete"
});


const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

  Item.find(function(err, itemList){
    if (err){
      console.log(err);
    }
    else{

      if (itemList.length === 0){
        Item.insertMany(defaultItems, function(err){
          if (err) console.log(err);
          else console.log("Success");
        });

        res.redirect("/");
      }

      else{
        res.render("list", {listTitle: "Today", newListItems: itemList});
      }

    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.item.push(item);
      foundList.save();

      res.redirect("/" + listName);
    })
  }



});


app.post("/delete", function(req, res){
  const id = req.body.checkbox;
  const listName = req.body.listName;
  // Item.deleteOne({_id: id});

  if (listName === "Today"){
    Item.findByIdAndRemove(id, function(err){
      if (err)
      console.log(err);
      else
      console.log("Successfully Removed the checked Item");
    });

    res.redirect("/");
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {item: {_id: id}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }

});



app.get("/:customListName", function(req, res){

  const customListName = lodash.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, resultList){
    if (resultList){
      // Show an existing list
        res.render("list", {listTitle: resultList.name, newListItems: resultList.item});
    }
    else{
      // Create a new list
        const list = new List({
          name: customListName,
          item: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
    }
  });
});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started successfully!");
});
