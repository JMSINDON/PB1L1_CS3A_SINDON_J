class Block {
    // Constructor creates a new block with its basic information.
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        // Creates a unique SHA-256 hash for the block
        return CryptoJS.SHA256(
            this.index + this.previousHash + this.timestamp + this.data + this.nonce
        ).toString();
    }
}
// This class manages the entire blockchain.
class Blockchain {

    constructor() {
        this.chain = [this.createGenesisBlock()];
    }
// CREATE GENESIS BLOCK
    createGenesisBlock() {
        return new Block(
            0,
            new Date().toLocaleString(),
            'Genesis Block',
            '0'
        );
    }


    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    //Adds a new block to the blockchain
    addBlock(data) {
        const newBlock = new Block(
            this.chain.length,
            new Date().toLocaleString(),
            data,
            this.getLatestBlock().hash
        );

        this.chain.push(newBlock);
    }

    // Checks if the blockchain is valid
    isValidChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Checks if the block's hash is correct
            if (currentBlock.hash !== currentBlock.calculateHash())
                return false;

            // Checks if blocks are properly connected  
            if (currentBlock.previousHash !== previousBlock.hash)
                return false;
        }
        // If all blocks pass the checks
        return true;
    }
}
// Get HTML elements
const blockchain = new Blockchain();
const chainEl = document.getElementById('chain');
const statusEl = document.getElementById('status');
const addBlockBtn = document.getElementById('addBlockBtn');
const validateBtn = document.getElementById('validateBtn');
const blockDataInput = document.getElementById('blockData');

// Displays all blocks on the webpage.
function renderChain() {
    chainEl.innerHTML = '';
    blockchain.chain.forEach((block, index) => {
        // Check if the block is valid
        const blockIsValid = index === 0 ||
            (
                block.hash === block.calculateHash() &&
                block.previousHash === blockchain.chain[index - 1].hash
            );

        const blockDiv = document.createElement('div');
        blockDiv.className = `block ${blockIsValid ? 'valid' : 'invalid'}`;
        blockDiv.innerHTML = `
            <div class="block-header">
                <h3>Block #${block.index}</h3>

                <span class="badge ${blockIsValid ? 'valid' : 'invalid'}">
                    ${blockIsValid ? 'Valid' : 'Invalid'}
                </span>
            </div>

            <div class="field">
                <span class="label">Timestamp</span>
                <div class="value">${block.timestamp}</div>
            </div>

            <div class="field">
                <span class="label">Data</span>
                <div 
                    class="value" 
                    contenteditable="true" 
                    data-index="${index}" 
                    data-field="data"
                >
                    ${block.data}
                </div>
            </div>

            <div class="field">
                <span class="label">Previous Hash</span>
                <div class="value">${block.previousHash}</div>
            </div>

            <div class="field">
                <span class="label">Hash</span>
                <div class="value">${block.hash}</div>
            </div>
        `;

        chainEl.appendChild(blockDiv);
    });
    // Updates the block when its data is edited
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.addEventListener('input', (e) => {
            const idx = Number(e.target.dataset.index);
            blockchain.chain[idx].data = e.target.innerText.trim();
            // Recalculate the hash after editing
            blockchain.chain[idx].hash =
                blockchain.chain[idx].calculateHash();
            // Update the following blocks
            for (let i = idx + 1; i < blockchain.chain.length; i++) {
                blockchain.chain[i].previousHash =
                    blockchain.chain[i - 1].hash;
                blockchain.chain[i].hash =
                    blockchain.chain[i].calculateHash();
            }

            updateStatus();

            renderChain();
        });
    });
}

function updateStatus() {

    const valid = blockchain.isValidChain();
    statusEl.textContent = valid ?
        'Chain is valid' :
        'Chain is invalid';
    statusEl.className = `status ${valid ? 'valid' : 'invalid'}`;
}
// Add a new block when the button is clicked
addBlockBtn.addEventListener('click', () => {


    const data = blockDataInput.value.trim() || 'Empty Data';

    blockchain.addBlock(data);
    blockDataInput.value = '';
    renderChain();
    updateStatus();
});
// Validate the blockchain
validateBtn.addEventListener('click', updateStatus);
// Press Enter to add a block
blockDataInput.addEventListener('keydown', (e) => {

    // Checks if the pressed key is Enter
    if (e.key === 'Enter') {
        addBlockBtn.click();
    }
});
// Display the blockchain when the page loads
renderChain();
updateStatus();