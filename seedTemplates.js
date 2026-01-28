const mongoose = require("mongoose");
const CodeTemplate = require("./models/CodeTemplate");
require("dotenv").config();

const templates = [
    {
        language: "javascript",
        template: `/**
 * @param {string} input - Input string
 * @return {string} - Output string
 */
function solution(input) {
    // Write your code here
    return "";
}

// Test your solution
const input = "sample input";
console.log(solution(input));`,
        description: "JavaScript ES6 template with function structure",
    },
    {
        language: "python",
        template: `def solution(input_str):
    """
    Args:
        input_str (str): Input string
    Returns:
        str: Output string
    """
    # Write your code here
    return ""

# Test your solution
if __name__ == "__main__":
    input_data = "sample input"
    print(solution(input_data))`,
        description: "Python 3 template with function and docstrings",
    },
    {
        language: "java",
        template: `import java.util.*;

public class Solution {
    /**
     * Main solution method
     * @param input Input string
     * @return Output string
     */
    public static String solution(String input) {
        // Write your code here
        return "";
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        System.out.println(solution(input));
        scanner.close();
    }
}`,
        description: "Java template with Scanner for input",
    },
    {
        language: "cpp",
        template: `#include <iostream>
#include <string>
using namespace std;

/**
 * Main solution function
 * @param input Input string
 * @return Output string
 */
string solution(string input) {
    // Write your code here
    return "";
}

int main() {
    string input;
    getline(cin, input);
    cout << solution(input) << endl;
    return 0;
}`,
        description: "C++ template with standard library",
    },
    {
        language: "c",
        template: `#include <stdio.h>
#include <string.h>

/**
 * Main solution function
 */
void solution(char* input) {
    // Write your code here
    printf("");
}

int main() {
    char input[1000];
    fgets(input, sizeof(input), stdin);
    input[strcspn(input, "\\n")] = 0; // Remove newline
    solution(input);
    return 0;
}`,
        description: "C template with stdio",
    },
];

async function seedTemplates() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB");

        // Clear existing templates
        await CodeTemplate.deleteMany({});
        console.log("🗑️  Cleared existing templates");

        // Insert new templates
        await CodeTemplate.insertMany(templates);
        console.log("✅ Seeded", templates.length, "code templates");

        console.log("\n📝 Available templates:");
        templates.forEach(t => console.log(`   - ${t.language}`));

        await mongoose.connection.close();
        console.log("\n✅ Database connection closed");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding templates:", error);
        process.exit(1);
    }
}

seedTemplates();
