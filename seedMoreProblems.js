const mongoose = require("mongoose");
const Problem = require("./models/problems");
const { Readable } = require("stream");
require("dotenv").config();

async function seedMoreProblems() {
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

        const extraProblems = [
            {
                title: "Valid Parentheses",
                description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets, and closed in the correct order.",
                difficulty: "Easy",
                tags: ["String", "Stack"],
                testCases: [
                    { input: "()", expectedOutput: "true" },
                    { input: "()[]{}", expectedOutput: "true" },
                    { input: "(]", expectedOutput: "false" }
                ]
            },
            {
                title: "Merge Intervals",
                description: "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
                difficulty: "Medium",
                tags: ["Array", "Sorting"],
                testCases: [
                    { input: "[[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]" },
                    { input: "[[1,4],[4,5]]", expectedOutput: "[[1,5]]" }
                ]
            },
            {
                title: "Longest Increasing Subsequence",
                description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
                difficulty: "Medium",
                tags: ["Array", "Dynamic Programming"],
                testCases: [
                    { input: "10 9 2 5 3 7 101 18", expectedOutput: "4" },
                    { input: "0 1 0 3 2 3", expectedOutput: "4" }
                ]
            }
        ];

        for (const p of extraProblems) {
            const exists = await Problem.findOne({ title: p.title });
            if (!exists) {
                const newProblem = new Problem({
                    title: p.title,
                    description: p.description,
                    difficulty: p.difficulty,
                    tags: p.tags
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

seedMoreProblems();
