let currentValue = "";
let firstValue = null;
let operator = null;
let percentageApplied = false;

const display = document.getElementById("display");

function updateDisplay(value) {
    display.textContent = value || "0";
}

function appendNumber(number) {
    currentValue += number;
    percentageApplied = false;

    if (operator && firstValue !== null) {
        updateDisplay(`${firstValue} ${operator} ${currentValue}`);
    } else {
        updateDisplay(currentValue);
    }
}

function clearDisplay() {
    currentValue = "";
    firstValue = null;
    operator = null;
    percentageApplied = false;
    updateDisplay("0");
}

function deleteLast() {
    if (percentageApplied) {
        percentageApplied = false;
    }

    currentValue = currentValue.slice(0, -1);

    if (operator && firstValue !== null) {
        updateDisplay(
            `${firstValue} ${operator} ${currentValue}`
        );
    } else {
        updateDisplay(currentValue);
    }
}

function chooseOperator(selectedOperator) {
    if (!currentValue) {
        return;
    }

    firstValue = Number(currentValue);
    operator = selectedOperator;
    currentValue = "";
    percentageApplied = false;

    updateDisplay(`${firstValue} ${operator}`);
}

function calculatePercentage() {
    if (!currentValue || percentageApplied) {
        return;
    }

    const value = Number(currentValue);

    if (firstValue !== null && operator) {
        currentValue = String((firstValue * value) / 100);

        updateDisplay(
            `${firstValue} ${operator} ${currentValue}`
        );
    } else {
        currentValue = String(value);
        updateDisplay(`${currentValue}%`);
    }

    percentageApplied = true;
}

async function calculateResult() {
    if (firstValue === null || !currentValue || !operator) {
        if (percentageApplied && firstValue === null && currentValue) {
            currentValue = String(Number(currentValue) / 100);
            percentageApplied = false;
            updateDisplay(currentValue);
        }

        return;
    }

    const secondValue = Number(currentValue);

    let operation;

    switch (operator) {
        case "+":
            operation = "addition";
            break;

        case "-":
            operation = "subtraction";
            break;

        case "*":
            operation = "multiplication";
            break;

        case "/":
            operation = "division";
            break;

        default:
            return;
    }

    try {
        const response = await fetch("/api/v1/calculator", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                operation: operation,
                a: firstValue,
                b: secondValue
            })
        });

        const data = await response.json();

        if (!response.ok) {
            updateDisplay(data.detail || "Error");
            return;
        }

        currentValue = String(data.result);
        firstValue = null;
        operator = null;
        percentageApplied = false;

        updateDisplay(currentValue);

    } catch (error) {
        updateDisplay("Service unavailable");
    }
}

const cidrInput = document.getElementById("cidr-input");
const cidrCalculateButton = document.getElementById("cidr-calculate");
const cidrError = document.getElementById("cidr-error");
const cidrResult = document.getElementById("cidr-result");

cidrCalculateButton.addEventListener("click", calculateCIDR);

async function calculateCIDR() {
    const cidr = cidrInput.value.trim();

    cidrError.textContent = "";
    cidrResult.classList.add("hidden");

    if (!cidr) {
        cidrError.textContent = "Please enter an IPv4 CIDR block.";
        return;
    }

    try {
        const response = await fetch(
            `/api/v1/cidr?cidr=${encodeURIComponent(cidr)}`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Unable to calculate CIDR.");
        }

        document.getElementById("cidr-network").textContent = data.network;
        document.getElementById("cidr-broadcast").textContent = data.broadcast;
        document.getElementById("cidr-subnet-mask").textContent = data.subnet_mask;
        document.getElementById("cidr-wildcard-mask").textContent = data.wildcard_mask;
        document.getElementById("cidr-first-host").textContent = data.first_host ?? "N/A";
        document.getElementById("cidr-last-host").textContent = data.last_host ?? "N/A";
        document.getElementById("cidr-total-addresses").textContent = data.total_addresses;
        document.getElementById("cidr-usable-hosts").textContent = data.usable_hosts;
        document.getElementById("cidr-prefix-length").textContent = `/${data.prefix_length}`;

        cidrResult.classList.remove("hidden");
    } catch (error) {
        cidrError.textContent = error.message;
    }
}

const converterCategory = document.getElementById("converter-category");
const converterValue = document.getElementById("converter-value");
const converterFrom = document.getElementById("converter-from");
const converterTo = document.getElementById("converter-to");
const converterCalculate = document.getElementById("converter-calculate");
const converterError = document.getElementById("converter-error");
const converterResult = document.getElementById("converter-result");
const converterResultValue = document.getElementById("converter-result-value");

const converterUnits = {
    length: ["m", "km", "cm", "mm", "ft", "in"],
    weight: ["kg", "g", "mg", "lb", "oz"],
    temperature: ["C", "F", "K"],
    data: ["B", "KB", "MB", "GB", "TB"]
};

function updateConverterUnits() {
    const units = converterUnits[converterCategory.value];

    converterFrom.innerHTML = "";
    converterTo.innerHTML = "";

    units.forEach((unit) => {
        converterFrom.add(new Option(unit, unit));
        converterTo.add(new Option(unit, unit));
    });

    if (units.length > 1) {
        converterTo.selectedIndex = 1;
    }
}

converterCategory.addEventListener("change", updateConverterUnits);

converterCalculate.addEventListener("click", async () => {
    const category = converterCategory.value;
    const value = converterValue.value;
    const fromUnit = converterFrom.value;
    const toUnit = converterTo.value;

    converterError.textContent = "";
    converterResult.classList.add("hidden");

    if (value === "") {
        converterError.textContent = "Please enter a value.";
        return;
    }

    try {
        const response = await fetch(
            `/api/v1/convert?category=${encodeURIComponent(category)}&from_unit=${encodeURIComponent(fromUnit)}&to_unit=${encodeURIComponent(toUnit)}&value=${encodeURIComponent(value)}`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Unable to convert the value.");
        }

        converterResultValue.textContent = data.result;
        converterResult.classList.remove("hidden");
    } catch (error) {
        converterError.textContent = error.message;
    }
});

updateConverterUnits();

// Quick Notes

const noteInput = document.getElementById("note-input");
const saveNoteButton = document.getElementById("save-note");
const notesList = document.getElementById("notes-list");
const noNotes = document.getElementById("no-notes");
const noteError = document.getElementById("note-error");

const NOTES_STORAGE_KEY = "utilityHubRecentNotes";

function getNotes() {
    try {
        return JSON.parse(sessionStorage.getItem(NOTES_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveNotes(notes) {
    sessionStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

function formatNoteTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
}

function renderNotes() {
    const notes = getNotes();

    notesList.innerHTML = "";

    if (notes.length === 0) {
        notesList.appendChild(noNotes);
        noNotes.classList.remove("hidden");
        return;
    }

    noNotes.classList.add("hidden");

    notes.forEach((note) => {
        const noteItem = document.createElement("div");
        noteItem.className = "note-item";

        const content = document.createElement("div");
        content.className = "note-content";
        content.textContent = note.text;

        const meta = document.createElement("div");
        meta.className = "note-meta";

        const time = document.createElement("span");
        time.className = "note-time";
        time.textContent = formatNoteTime(note.createdAt);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-note";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteNote(note.id);
        });

        meta.appendChild(time);
        meta.appendChild(deleteButton);

        noteItem.appendChild(content);
        noteItem.appendChild(meta);

        notesList.appendChild(noteItem);
    });
}

function addNote() {
    const text = noteInput.value.trim();

    noteError.textContent = "";

    if (!text) {
        noteError.textContent = "Please enter a note.";
        return;
    }

    const notes = getNotes();

    const newNote = {
        id: Date.now(),
        text: text,
        createdAt: new Date().toISOString()
    };

    notes.unshift(newNote);
    saveNotes(notes);

    noteInput.value = "";
    renderNotes();
}

function deleteNote(noteId) {
    const notes = getNotes().filter((note) => note.id !== noteId);
    saveNotes(notes);
    renderNotes();
}

saveNoteButton.addEventListener("click", addNote);

renderNotes();