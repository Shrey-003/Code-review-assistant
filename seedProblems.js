const mongoose = require("mongoose");
const Problem = require("./models/problems");
const { Readable } = require("stream");
require("dotenv").config();

async function seedProblems() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const db = mongoose.connection.db;
        const gfs = new mongoose.mongo.GridFSBucket(db, { bucketName: "problem_data" });

        const writeGridFSFile = (filename, content) => {
            return new Promise(async (resolve, reject) => {
                const files = await gfs.find({ filename }).toArray();
                if (files.length > 0) {
                    await gfs.delete(files[0]._id);
                }
                const uploadStream = gfs.openUploadStream(filename);
                const readable = Readable.from(content);
                uploadStream.on("finish", resolve);
                uploadStream.on("error", reject);
                readable.pipe(uploadStream);
            });
        };

        const starterProblems = [
            {
                title: "Two Sum",
                description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
                difficulty: "Easy",
                testCases: [
                    { input: "2 7 11 15\n9", expectedOutput: "0 1" },
                    { input: "3 2 4\n6", expectedOutput: "1 2" },
                    { input: "3 3\n6", expectedOutput: "0 1" }
                ]
            },
            {
                title: "Reverse String",
                description: "Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
                difficulty: "Easy",
                testCases: [
                    { input: "hello", expectedOutput: "olleh" },
                    { input: "Hannah", expectedOutput: "hannaH" }
                ]
            },
            {
                title: "Palindrome Number",
                description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
                difficulty: "Medium",
                testCases: [
                    { input: "121", expectedOutput: "true" },
                    { input: "-121", expectedOutput: "false" },
                    { input: "10", expectedOutput: "false" }
                ]
            }
        ];

        for (const p of starterProblems) {
            const exists = await Problem.findOne({ title: p.title });
            if (!exists) {
                const newProblem = new Problem({
                    title: p.title,
                    description: p.description,
                    difficulty: p.difficulty
                });
                await newProblem.save();
                
                const id = newProblem._id.toString();
                const inputs = p.testCases.map(tc => tc.input);
                const outputs = p.testCases.map(tc => tc.expectedOutput);
                
                await writeGridFSFile(`${id}_input.txt`, JSON.stringify(inputs, null, 2));
                await writeGridFSFile(`${id}_expected_output.txt`, JSON.stringify(outputs, null, 2));
                
                console.log(`✅ Seeded problem: ${p.title}`);
            } else {
                console.log(`⚠️ Problem already exists: ${p.title}`);
            }
        }

        console.log("🎉 Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seedProblems();
