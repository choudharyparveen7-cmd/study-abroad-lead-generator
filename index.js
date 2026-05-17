import fs from "fs";
import axios from "axios";
import { createObjectCsvWriter } from "csv-writer";
import keywords from "./keywords.json" with { type: "json" };

const leads = [];

async function searchReddit(keyword) {
    try {
        const url =
            `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=new`;

        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const posts = response.data.data.children;

        posts.forEach(post => {
            const p = post.data;

            leads.push({
                keyword,
                title: p.title,
                url: `https://reddit.com${p.permalink}`
            });
        });

        console.log(`Scanned: ${keyword}`);

    } catch (err) {
        console.log(err.message);
    }
}

async function run() {

    for (const keyword of keywords) {
        await searchReddit(keyword);
    }

    if (!fs.existsSync("./output")) {
        fs.mkdirSync("./output");
    }

    const csvWriter = createObjectCsvWriter({
        path: "./output/leads.csv",
        header: [
            { id: "keyword", title: "Keyword" },
            { id: "title", title: "Title" },
            { id: "url", title: "URL" }
        ]
    });

    await csvWriter.writeRecords(leads);

    console.log(`Saved ${leads.length} leads`);
}

run();
