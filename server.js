const express = require('express');
const bodyParser = require('body-parser');
const sanitizeHTML = require('sanitize-html');
const mongoClient = require('mongodb').MongoClient;
const app = express();
require('dotenv').config();
app.set("view engine", "ejs");
app.use(express.static("public"))
app.use(bodyParser.json());

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

mongoClient.connect(process.env.mongodbConnectionString, {
    useUnifiedTopology: true})
        .then(client => {
            console.log("Connected to MongoDB");
            const db = client.db('runCounterDB');
            const runsCollection = db.collection('runs');

            app.use(bodyParser.urlencoded({ extended: true }));
            // CRUD Handlers
            app.post("/runs", (req, res) => {
                const newrun = req.body;
                if(!newrun.bossname) {
                    // console.log("invalid name!")
                    return res.redirect("/");
                }
                if (!newrun.run) {
                    newrun.run = 0;
                }
                newrun.run = parseInt(newrun.run);
                newrun.bossname = sanitizeHTML(newrun.bossname);
                runsCollection.insertOne(newrun)
                    .then(result => {
                        res.redirect("/?bossname="+newrun.bossname);
                    })
                    .catch(error => {
                        console.log(error);
                    });
            });
            app.get("/", (req, res) => {
                db.collection('runs').find().toArray()
                    .then(results => {
                        // console.log(results);
                        const bossname = sanitizeHTML(req.query.bossname)
                        console.log(bossname);
                        let run = null;
                        if (bossname) {
                            run = results.find(run => run.bossname === bossname);
                        }
                        res.render("index.ejs", { runs: results, run });
                        // res.redirect("/");
                    })
                    .catch(error => console.error(error));
            });
            app.put("/runs", async (req, res) => {
                // console.log(req.body);
                //runsCollection.findOne("run"
                const allRuns = await runsCollection.find().toArray();
                const bossname = sanitizeHTML(req.body.bossname);
                const run = allRuns.find(r => r.bossname === bossname);
                if (!run) {
                    return res.status(404).send("Run not found");
                }
                try {
                    const result = await runsCollection.findOneAndUpdate(
                        { bossname: run.bossname },
                        {
                            $set: {
                                bossname: run.bossname,
                                run: run.run + 1
                            }
                        },
                        {
                            upsert: true
                        }
                    )
                    // console.log(result)
                    res.json("success")
                } catch (error) {
                    console.log(error);
                }

            
            });
            app.delete("/runs", (req, res) => {
                const bossname = sanitizeHTML(req.body.bossname);
                runsCollection.deleteOne({ bossname: bossname })
                    .then(result => {
                        if (result.deletedCount == 0) {
                            res.json("Run not found");
                        } else {
                            res.json("deleted");
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
    )}
).catch(error => {console.error(error)});

