const express = require("express");
var connectDB = require("./config/db");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cors = require('cors');
const corsOptions ={
    origin: ["https://k40db0.csb.app", "gooogle.com"],
    credentials:true,           
    optionSuccessStatus:200
}
const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();
const { Schema } = mongoose;
var studentSchema = new Schema({
	registrationNumber:{
		type:Number,
		required:true,
		default:111111111
	},
	name: {
		type: String,
		default: "student",
		required: true,
	},
	hostel: {
		type: String,
		default: "vsista",
		required: true,
	},
	address: {
		type: String,
		default: "Indian",
		required: true,
	},
	mobile: {
		type: Number,
		minlength: 10,
		maxlength: 10,
		default:4561287935,
	},
	standard: {
		type: Number,
		required: true,
		min: [1, "Student cannot be less than standard 1"],
		max: [10, "Student cannot be more than 10"],
	},
	semester: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Mark",
	},
});

var markSchema = new Schema({
	registrationNumber:{
		type:Number,
		required:true,
		default:111111111
	},
	student: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Student",
	},
	sem1: { type: Map, of: Number },
	sem2: { type: Map, of: Number },
	sem3: { type: Map, of: Number },
	sem4: { type: Map, of: Number },
	sem5: { type: Map, of: Number },
	sem6: { type: Map, of: Number },
	sem7: { type: Map, of: Number },
	sem8: { type: Map, of: Number },
});

var userSchema = new Schema({
	type: {type:String,default:"Student"},
	username: String,
	isLoggedIn: {type:Boolean,default:false},
	userid: {type:Number , default:123},
	password: {type: String, default:"guest"}
});

const Student = mongoose.model("Student", studentSchema);
const Mark = mongoose.model("Mark", markSchema);
const User = mongoose.model("User",userSchema);
app.get("/", (req, res) => {
	Student.find({}).
	populate('semester').
	exec((fail,success) => {
		if(fail) return res.status(400).json({"failed":"unable to retive daata"})
		return res.status(200).json(success);
	});
});

app.get("/student/:ide",(req,res) => {
	// var studentide=mongoose.Types.ObjectId(req.params.ide);
	let registrationNumber = req.params.ide;
	Student.findOne({registrationNumber}).
	populate('semester').
	exec((fail,success) => {
		if(fail) return res.status(400).json({"failed":"unable to retive daata"})
		return res.status(200).json(success);
	});
});

app.get('/createuser',(req,res) => {
	let username=req.body.username;
	let userid = req.body.userid;
	let type = req.body.type;
	let userObject = {username:username,userid:userid,type:type};
	User.create(userObject,(fail,success)=>{
		if(fail) res.status(400).json({status:"failed"});
		res.status(200).json(success);
	})
})

app.post('/retriveUserData',async(req,res) => {
	try{
		console.log(req.body.userid);
	let waiting = await User.find({userid:req.body.userid});
	console.log(waiting);
	res.status(200).json(waiting);
	}
	catch(err){
		console.log("err");
		res.status(400).json({failed:"failed"});
	}
});

app.post("/student", async (req, res) => {
	console.log(req.body);
	var obj = req.body;
	console.log("body is ", req.body);
	Student.create(obj, async (fail, suc) => {
		if (fail) {
			console.log("failed insertion");
			res.status(400).json({ error: "unable to insert" });
		}
		else{
			Mark.create({
			registrationNumber:suc.registrationNumber,
			student: suc._id,
		},(fail2,suc2) => {
			if(fail2){
				console.log("failed in creating marks");
			}
			else{
				var semesteride=mongoose.Types.ObjectId(suc2._id);
				Student.findOneAndUpdate({_id:suc._id},{semester:semesteride},(fail3,suc3)=>{
			if(fail3){
				console.log("unable to find and update student");
				res.status(400).json({error: "unable to ceate marks but created student data"});	
			}
			else{
				console.log("success in finding and updating student");
				Student.findOne({_id:suc._id})
				.populate('semester')
				.exec((fail4,suc4) => {
					if(fail4){
						console.log("error in populating the student");
						res.status(400).json({error: "unable to ceate marks but created student data"});	
					}
					else{
						console.log("success in populating the student");
						res.status(200).json(suc4);
					}
				})
			}
		})
			}
		});
		}

		}
	);
});

app.put("/student/:ide",(req,res)=>{
	var studentide= mongoose.Types.ObjectId(req.params.ide);
	var obj=req.body;

	Student.findOneAndUpdate({_id:studentide},obj, (fail,pass) => {
		if(fail) {
			console.log("failed");
			res.status(400).json({"failed":"failed to update the student data"});
		}
		if(pass){
		console.log("pass");
		Student.find({_id:studentide},(f,s) => {
			res.status(200).json(s);
			
		})
		}
	});
});

app.get("/marks/:ide", (req, res) => {
	var studentide = mongoose.Types.ObjectId(req.params.ide);
	Mark.find({ student: studentide }, (suc, fail) => {
		res.status(200).json(fail);
	});
});

app.post("/marks/:ide", async (req, res) => {
	var obj = req.body;
	console.log(obj);
	var sem_to_be_added = Object.keys(obj)[0];
	var data_to_be_added = req.body[sem_to_be_added];
	var studentide = mongoose.Types.ObjectId(req.params.ide);
	console.log("data to be added",data_to_be_added);

	try {
		console.log(req.params.ide);
		var result = await Mark.findOne({ student: req.params.ide });
		console.log("finding mark",result)
	} catch (err) {
		console.log("error occured");
	}
	
	var mapping = new Map();
	if (result[sem_to_be_added] !== undefined) { mapping = result[sem_to_be_added];} 
	for (const key in data_to_be_added) {mapping.set(key, data_to_be_added[key]); }

	var mapToString = {};
	mapping.forEach((item, item2) => {
		// console.log("*****************",typeof item);
		mapToString[item2] = item;
	});
	var obj3 = { [sem_to_be_added]: mapping };
	console.log('-------updating object-------');
	console.log(obj3);
	Mark.findOneAndUpdate({ student: studentide }, obj3, async (fail, suc) => {
		if (fail) {
			res.status(400).json({ fail: "unable to updated" });
		}
		console.log("success in updating");
		Student.findOne({_id:studentide}).
		populate('semester').
		exec((fail,success) => {
		if(fail) return res.status(400).json({"failed":"unable to retive daata"})
		console.log("----*****END OF EXECUTION *------------");
		return res.status(200).json(success);
	});
	});
});


app.delete("/student/:ide", async (req, res) => {
	var studentide = mongoose.Types.ObjectId(req.params.ide);
	
	try {
		const del = await Student.deleteMany({_id:studentide});
		if (del) {
			res.status(200).json({ success: "deleted" });
		}
		res.status(200).json({ failure: "Not deleted" });
	} catch (err) {
		res.status(400).json({ failure: "unexpected error occured" });
	}
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log("running on the port", PORT);
});
