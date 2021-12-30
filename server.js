const express = require('express');
const bodyParser = require('body-parser');
const sanitizeHTML = require('sanitize-html');
const mongoClient = require('mongodb').MongoClient;
const helper = require("./helper.js")
const app = express();
require('dotenv').config();
app.set("view engine", "ejs");
app.use(express.static("public"))
app.use(bodyParser.json());
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Server running on port ' + port);
});


String.prototype.title = function() {
    return this.toString().replace(
        /\w\S*/g,
        txt => {
            return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        });
};
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
            // Sends the bossname (& more)
            app.get("/", (req, res) => {
                db.collection('runs').find().toArray()
                    .then(results => {
                        // console.log(results);
                        const bossname = sanitizeHTML(req.query.bossname)
                        console.log("loaded",bossname);
                        let run = null;
                        if (bossname) {
                            run = results.find(run => run.bossname.toLowerCase() === bossname.toLowerCase());
                            // run.bossname = run.bossname.title();
                        }
                        res.render(
                            "index.ejs", { 
                                runs: results,
                                run,
                                helper,
                                testString: process.env.testString
                        });
                        // res.redirect("/");
                    })
                    .catch(error => console.error(error));
            });
            app.put("/runs", async (req, res) => {
                const allRuns = await runsCollection.find().toArray();
                const bossname = sanitizeHTML(req.body.bossname);
                const run = allRuns.find(r => r.bossname.toLowerCase() === bossname.toLowerCase());
                if (!run) {
                    return res.status(404).json({error: "not found"});
                }
                const updatedBossRun = {
                    bossname: run.bossname,
                    run: run.run+1,
                }
                try {
                    const result = await runsCollection.findOneAndUpdate(
                        { bossname: run.bossname },
                        {
                            $set: updatedBossRun
                        },
                        {
                            upsert: true
                        }
                    )
                    res.json(updatedBossRun);
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

