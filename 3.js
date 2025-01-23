/**
 * 3. Compress file data.json để đạt được file size là nhỏ nhất có thể (Không dùng bất ký thư viện nào).
 */

const fs = require('fs');

class JSONCompressor {
    constructor() {
        this.keyMap = null;
    }
    
    generateKeyMap(json) {
        const keySet = new Set();
        const keyArray = [];
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    
        function collectKeys(obj) {
            if (typeof obj !== 'object' || obj === null) return;
            if (Array.isArray(obj)) {
                obj.forEach(item => collectKeys(item));
            } else {
                Object.keys(obj).forEach(key => {
                    if (!keySet.has(key)) {
                        keySet.add(key);
                        keyArray.push(key);
                    }
                    collectKeys(obj[key]);
                });
            }
        }
    
        collectKeys(json);
    
        const keyMap = {};
        keyArray.forEach((key, index) => {
            let result = '';
            let currentIndex = index;
            do {
                result = alphabet[currentIndex % 26] + result;
                currentIndex = Math.floor(currentIndex / 26) - 1;
            } while (currentIndex >= 0);
            keyMap[key] = result;
        });
    
        return keyMap;
    } 

    optimizeKeys(jsonObj, keyMap) {
        if (typeof jsonObj !== 'object' || jsonObj === null) {
            return jsonObj;
        }
        if (Array.isArray(jsonObj)) {
            return jsonObj.map(item => this.optimizeKeys(item, keyMap));
        }
        const optimized = {};
        for (const [key, value] of Object.entries(jsonObj)) {
            const newKey = keyMap[key] || key;
            optimized[newKey] = this.optimizeKeys(value, keyMap);
        }
        return optimized;
    }

    minifyJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            return JSON.stringify(parsed);
        } catch (error) {
            throw new Error('Minification failed: Invalid JSON');
        }
    }

    removeSpaces(jsonString) {
        let result = '';
        let inString = false;
        let prevChar = '';

        for (let i = 0; i < jsonString.length; i++) {
            const char = jsonString[i];
            if (char === '"' && prevChar !== '\\') {
                inString = !inString;
            }
            if (inString || !/\s/.test(char)) {
                result += char;
            }
            prevChar = char;
        }
        return result;
    }

    convertDatesToTimestamps(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;

        if (Array.isArray(obj)) {
            return obj.map(item => this.convertDatesToTimestamps(item));
        }

        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string' && !isNaN(Date.parse(value))) {
                result[key] = new Date(value).getTime() / 1000;
            } else {
                result[key] = this.convertDatesToTimestamps(value);
            }
        }
        return result;
    }

    compressRLE(data) {
        let compressed = '';
        let i = 0;
    
        while (i < data.length) {
            let count = 1;
            while (i + 1 < data.length && data[i] === data[i + 1] && count < 9) {
                count++;
                i++;
            }

            if (count > 3) {
                compressed += count + data[i];
            } else {
                compressed += data[i].repeat(count);
            }
            i++;
        }
    
        return compressed;
    }

    decompressRLE(data) {
        let decompressed = '';
        let count = '';
    
        for (const char of data) {
            if (!isNaN(char)) {
                count += char; // Tích lũy số lượng
            } else {
                decompressed += char.repeat(Number(count)); // Lặp lại ký tự
                count = '';
            }
        }
        return decompressed;
    }

    compress(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            
            const minified = this.minifyJSON(jsonString);
            const noSpaces = this.removeSpaces(minified);
            
            this.keyMap = this.generateKeyMap(parsed);
            const convertedDates = this.convertDatesToTimestamps(JSON.parse(noSpaces));
            const optimized = this.optimizeKeys(convertedDates, this.keyMap);
    
            const finalJson = JSON.stringify(optimized);
            const finalCompressed = this.compressRLE(finalJson);
    
            return {
                original: {
                    content: jsonString,
                    size: jsonString.length,
                },
                final: {
                    content: finalCompressed,
                    size: finalCompressed.length,
                },
                keyMap: this.keyMap,
                compressionRatio: ((jsonString.length - finalCompressed.length) / jsonString.length * 100).toFixed(2) + '%',
            };
        } catch (error) {
            throw new Error(`Compression failed: ${error.message}`);
        }
    }    

    decompress(compressedJson) {
        if (!this.keyMap) {
            throw new Error('KeyMap is missing. Please optimize first before decoding.');
        }
    
        const reverseMap = {};
        for (const [key, value] of Object.entries(this.keyMap)) {
            reverseMap[value] = key;
        }
    
        function restoreKeys(obj) {
            if (typeof obj !== 'object' || obj === null) return obj;
            if (Array.isArray(obj)) return obj.map(restoreKeys);
    
            const restored = {};
            for (const [key, value] of Object.entries(obj)) {
                const originalKey = reverseMap[key] || key;
                restored[originalKey] = restoreKeys(value);
            }
            return restored;
        }
    
        try {
            const decompressed = this.decompressRLE(compressedJson);
            const parsed = JSON.parse(decompressed);
    
            return JSON.stringify(restoreKeys(parsed), null, 2);
        } catch (error) {
            throw new Error(`Decompression failed: ${error.message}`);
        }
    }    
}

const optimizer = new JSONCompressor();

const rawData = fs.readFileSync('data.json', 'utf8');
const result = optimizer.compress(rawData);

console.log('Original size:', result.original.size);
console.log('Size after compression + RLE:', result.final.size);
console.log('Compression ratio:', result.compressionRatio);

fs.writeFileSync('data-optimized.json', result.final.content);

