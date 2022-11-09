import fs from 'fs';

const copyFile = (inp, out) => {
    if (!fs.existsSync(out))
        fs.copyFileSync(inp, out)
}

const files = {
    '.env.sample': [
        '.env',
        '.env.local'
    ],
    '.secret.sample': [
        '.secret.local'
    ]
}

for (const [inputFile, outputFiles] of Object.entries(files))
    for (const out of outputFiles )
        copyFile(inputFile, out)






