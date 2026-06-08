const fs = require('fs');
const path = require('path');
const https = require('https');

const screens = [
  {
    title: 'Marketplace Listing',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2RjOWU2YjQwNTkwODRjYWQ5ODkwNDFkZjgyMmJmMWQ3EgsSBxCmrKuAzAEYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODg4NDk0NzQ0OTU3OTY5NDMw&filename=&opi=89354086'
  },
  {
    title: 'Soil Health Analyzer',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1MzNmYmU4ZTNiM2YwOTI1YzdiZTk4MmVjZjZlEgsSBxCmrKuAzAEYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODg4NDk0NzQ0OTU3OTY5NDMw&filename=&opi=89354086'
  },
  {
    title: 'Fertilizer Information Guide',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzYzM2FkYTliMjEwYzRhNDA5YTQzZWQ3MWEzYjk0MGU0EgsSBxCmrKuAzAEYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODg4NDk0NzQ0OTU3OTY5NDMw&filename=&opi=89354086'
  },
  {
    title: 'Farmer Dashboard',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1MzNmYmVkMzQ4ZjMwNTAzYzgyZDM2MTlmZmJkEgsSBxCmrKuAzAEYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODg4NDk0NzQ0OTU3OTY5NDMw&filename=&opi=89354086'
  },
  {
    title: 'Pest & Disease Alerts',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2QwYWE0MjY5YjQ4MjQyYzg5NTgyY2M2MTcwYzdhODMyEgsSBxCmrKuAzAEYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODg4NDk0NzQ0OTU3OTY5NDMw&filename=&opi=89354086'
  },
  {
    title: 'Crop Recommendation Dashboard',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1MzNmYmU5ZDk5MTMwMjBjYzBlMDVlMjY0MGJmEgsSBxCmrKuAzAEYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODg4NDk0NzQ0OTU3OTY5NDMw&filename=&opi=89354086'
  },
  {
    title: 'Weather Forecast Dashboard',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2I4Yzk1NjY0MDA2MDQ1NzU4MmFmYjNmMDNlZjcyOTFlEgsSBxCmrKuAzAEYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODg4NDk0NzQ0OTU3OTY5NDMw&filename=&opi=89354086'
  },
  {
    title: 'Crop Price Trends',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzI4NGYwMWMzZTRlNzRkZGVhMjA0ZjM5MWE0Mjg2Yjc3EgsSBxCmrKuAzAEYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODg4NDk0NzQ0OTU3OTY5NDMw&filename=&opi=89354086'
  },
  {
    title: 'Smart Irrigation Center',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2ZlOWY0MDlkMDBiNjQyZmY5MWVmZGFhY2NjYzM4YTk0EgsSBxCmrKuAzAEYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODg4NDk0NzQ0OTU3OTY5NDMw&filename=&opi=89354086'
  },
  {
    title: 'Plant Disease Scanner',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1MzNmYmU4MzY1NTgwMWE2MmNkZTY5MDExOTM5EgsSBxCmrKuAzAEYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODg4NDk0NzQ0OTU3OTY5NDMw&filename=&opi=89354086'
  },
  {
    title: 'Government Schemes',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2I4MWQyOTBmMGUzYjQ4NjNhZDFmNmE2ZTIyMmE5YTRkEgsSBxCmrKuAzAEYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODg4NDk0NzQ0OTU3OTY5NDMw&filename=&opi=89354086'
  }
];

const outputDir = path.join(process.cwd(), 'frontend', 'public', 'stitch-mockups');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadFile(url, destPath, callback) {
  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Failed to download ${url}: status code ${res.statusCode}`);
      callback(new Error(`Status ${res.statusCode}`));
      return;
    }
    const fileStream = fs.createWriteStream(destPath);
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      callback(null);
    });
  }).on('error', (err) => {
    console.error(`Error requesting ${url}: ${err.message}`);
    callback(err);
  });
}

function downloadNext(index) {
  if (index >= screens.length) {
    console.log('All screens downloaded successfully!');
    return;
  }
  const screen = screens[index];
  const filename = screen.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.html';
  const destPath = path.join(outputDir, filename);
  console.log(`Downloading "${screen.title}" to ${destPath}...`);
  downloadFile(screen.url, destPath, (err) => {
    if (err) {
      console.error(`Error downloading ${screen.title}`);
    } else {
      console.log(`Successfully saved ${filename}`);
    }
    downloadNext(index + 1);
  });
}

downloadNext(0);
