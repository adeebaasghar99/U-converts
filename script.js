document.addEventListener('DOMContentLoaded', () => {
    // Create hamburger menu dynamically
    const menuIcon = document.createElement('div');
    menuIcon.className = 'menu-icon';
    menuIcon.innerHTML = '<span></span><span></span><span></span>';
    document.body.appendChild(menuIcon);

    // Toggle menu
    menuIcon.addEventListener('click', () => {
        menuIcon.classList.toggle('active');
        document.querySelector('article').classList.toggle('active');
    });
});

// Tab switching functionality
function switchTab(tabName, selectionName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    let tabName2 = tabName.toLowerCase()
    const fromUnit = document.getElementById(`${tabName2}-from-unit`);
    const toUnit = document.getElementById(`${tabName2}-to-unit`);
    const unitOptions = {
        area: {
            units: [
                { value: "square-meters", label: "Square Meters" },
                { value: "square-kilometers", label: "Square Kilometers" },
                { value: "acres", label: "Acres" },
                { value: "square-feet", label: "Square Feet" }
            ],
            conversions: {}
        },
        currency: {
            units: [
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
                { value: "JPY", label: "JPY" },
                { value: "CAD", label: "CAD" }
            ],
            conversions: {}
        },
        length: {
            units: [
                { value: "meters", label: "Meters" },
                { value: "kilometers", label: "Kilometers" },
                { value: "miles", label: "Miles" },
                { value: "yards", label: "Yards" },
                { value: "feet", label: "Feet" },
                { value: "inches", label: "Inches" }
            ],
            conversions: {}
        },
        speed: {
            units: [
                { value: "kilometer-per-hour", label: "Kilometers per Hour (km/h)" },
                { value: "miles-per-hour", label: "Miles per Hour (mph)" },
                { value: "meter-per-seconds", label: "Meters per Second (m/s)" }
            ],
            conversions: {}
        },
        temperature: {
            units: [
                { value: "celsius", label: "Celsius" },
                { value: "fahrenheit", label: "Fahrenheit" },
                { value: "kelvin", label: "Kelvin" }
            ],
            conversions: {}
        },
        time: {
            units: [
                { value: "days", label: "Days" },
                { value: "hours", label: "Hours" },
                { value: "minutes", label: "Minutes" },
                { value: "seconds", label: "Seconds" }
            ],
            conversions: {}
        },
        volume: {
            units: [
                { value: "liters", label: "Liters" },
                { value: "gallons", label: "Gallons" },
                { value: "cubic-meters", label: "Cubic Meters" }
            ],
            conversions: {}
        },
        weight: {
            units: [
                { value: "kilograms", label: "Kilograms" },
                { value: "pounds", label: "Lbs" },
                { value: "grams", label: "Grams" }
            ],
            conversions: {}
        }
    };

    // Dynamically generate all conversion pairs for each category
    Object.keys(unitOptions).forEach(category => {
        const units = unitOptions[category].units;
        units.forEach(fromUnit => {
            units.forEach(toUnit => {
                if (fromUnit.value !== toUnit.value) { // Exclude same-unit conversions
                    const key = `${fromUnit.value}-to-${toUnit.value}`;
                    unitOptions[category].conversions[key] = {
                        from: units.map(unit => `<option value="${unit.value}">${unit.label}</option>`).join(''),
                        to: units.map(unit => `<option value="${unit.value}">${unit.label}</option>`).join('')
                    };
                    // Set default selected options
                    unitOptions[category].conversions[key].from = unitOptions[category].conversions[key].from.replace(
                        `<option value="${fromUnit.value}">${fromUnit.label}</option>`,
                        `<option value="${fromUnit.value}" selected>${fromUnit.label}</option>`
                    );
                    unitOptions[category].conversions[key].to = unitOptions[category].conversions[key].to.replace(
                        `<option value="${toUnit.value}">${toUnit.label}</option>`,
                        `<option value="${toUnit.value}" selected>${toUnit.label}</option>`
                    );
                }
            });
        });
    });

    if (unitOptions[tabName2] && unitOptions[tabName2].conversions[selectionName]) {
        fromUnit.innerHTML = unitOptions[tabName2].conversions[selectionName].from;
        toUnit.innerHTML = unitOptions[tabName2].conversions[selectionName].to;
    }


    document.getElementById(tabName2).classList.add('active');

    document.querySelector(`button[onclick="switchTab('${tabName2}')"]`).classList.add('active');

}
async function fetchExchangeRates(country) {
    const apiKey = '99dd832de7cf460dc5ff634f'; // Replace with your ExchangeRate-API key
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${country}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.result === 'success') {
            let exchangeRates = data.conversion_rates;
            return exchangeRates
        } else {
            console.error('API error:', data['error-type']);
            fallbackToStaticRates();
        }
    } catch (error) {
        console.error('Fetch error:', error);
        fallbackToStaticRates();
    }
}

async function convert(type, direction) {
    const fromInput = document.getElementById(`${type}-from`);
    const toInput = document.getElementById(`${type}-to`);
    const fromUnit = document.getElementById(`${type}-from-unit`).value;
    const toUnit = document.getElementById(`${type}-to-unit`).value;
    let fromValue = parseFloat(fromInput.value);

    if (isNaN(fromValue) && direction === 'from') {
        toInput.value = '';
        return;
    }

    let result;

    // Length Conversion
    if (type === 'length') {
        const lengthFactors = {
            meters: 1,
            kilometers: 1000,
            miles: 1609.34,
            yards: 0.9144,
            feet: 0.3048,
            inches: 0.0254
        };
        const valueInMeters = fromValue * lengthFactors[fromUnit];
        result = valueInMeters / lengthFactors[toUnit];
    }

    // Area Conversion
    if (type === 'area') {
        const areaFactors = {
            'square-meters': 1,
            'square-kilometers': 1e6,
            'acres': 4046.86,
            'square-feet': 0.092903
        };
        const valueInSquareMeters = fromValue * areaFactors[fromUnit];
        result. = valueInSquareMeters / areaFactors[toUnit];
    }

    // Currency Conversion (Fixed with real-time rates)
    if (type === 'currency') {
        let exchangeRates = await fetchExchangeRates(fromUnit)
        const valueInCurrency = fromValue * exchangeRates[fromUnit];
        result = valueInCurrency * exchangeRates[toUnit];
    }

    // Speed Conversion
    if (type === 'speed') {
        const speedFactors = {
            kmh: 1,
            mph: 0.621371,
            ms: 0.277778
        };
        
        const valueInKmh = fromValue * speedFactors[toUnit];
        result = valueInKmh;
    }

    // Temperature Conversion
    if (type === 'temperature') {
        let valueInCelsius;
        if (fromUnit === 'celsius') valueInCelsius = fromValue;
        else if (fromUnit === 'fahrenheit') valueInCelsius = (fromValue - 32) * 5 / 9;
        else if (fromUnit === 'kelvin') valueInCelsius = fromValue - 273.15;

        if (toUnit === 'celsius') result = valueInCelsius;
        else if (toUnit === 'fahrenheit') result = (valueInCelsius * 9 / 5) + 32;
        else if (toUnit === 'kelvin') result = valueInCelsius + 273.15;
    }

    // Time Conversion
    if (type === 'time') {
        const timeFactors = {
            seconds: 1,
            minutes: 60,
            hours: 3600,
            days: 86400
        };
        const valueInSeconds = fromValue * timeFactors[fromUnit];
        result = valueInSeconds / timeFactors[toUnit];
    }

    // Volume Conversion
    if (type === 'volume') {
        const volumeFactors = {
            liters: 1,
            gallons: 3.78541,
            'cubic-meters': 1000
        };
        const valueInLiters = fromValue * volumeFactors[fromUnit];
        result = valueInLiters / volumeFactors[toUnit];
    }

    // Weight/Mass Conversion
    if (type === 'weight') {
        const weightFactors = {
            kilograms: 1,
            pounds: 0.453592,
            grams: 0.001
        };
        const valueInKilograms = fromValue * weightFactors[fromUnit];
        result = valueInKilograms / weightFactors[toUnit];
    }

    // Update "To" field for all conversions except 'to' direction in currency
    if (type == "currency") {
        toInput.value = result ? result.toFixed(4) : '';
    } else {
        toInput.value = result ? result.toFixed(2) : '';
    }
}
// Ensure exchangeRates is defined globally and populated (from previous API code)

function fallbackToStaticRates() {
    exchangeRates = {
        USD: 1.00,
        EUR: 0.95,
        GBP: 0.80,
        AED: 3.67,
        JPY: 150.00,
        INR: 83.00
    };
    console.warn('Using fallback static rates');
}


// Swap units functionality
function swapUnits(type) {
    const fromUnit = document.getElementById(`${type}-from-unit`);
    const toUnit = document.getElementById(`${type}-to-unit`);
    const fromValue = document.getElementById(`${type}-from`).value;

    const tempUnit = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = tempUnit;

    if (fromValue) {
        convert(type, 'from');
    }
}

// Define unit categories, their units, and possible conversions
const unitCategories = {
    'Weight': {
        units: {
            'kilograms': ['kilograms', 'kg', 'kilograms', 'kg'], // 'ka' from document (likely a typo for 'kg')
            'grams': ['grams', 'g', 'grams'],
            'pounds': ['pound', 'lb', 'lbs', 'pounds'],
        },
        convertibleUnits: ['kilograms', 'grams', 'pounds']
    },
    'Length': {
        units: {
            'kilometers': ['kilometer', 'km', 'kilometers'],
            'miles': ['mile', 'mi', 'miles'],
            'meters': ['meter', 'm', 'meters'],
            'yards': ['yard', 'yd', 'yards'],
            'feet': ['foot', 'ft', 'feet'],
            'inches': ['inch', 'in', 'inches']
        },
        convertibleUnits: ['kilometers', 'miles', 'meters', 'yards', 'feet', 'inches']
    },
    'Temperature': {
        units: {
            'celsius': ['celsius', 'C', '°C'],
            'fahrenheit': ['fahrenheit', 'F', '°F'],
            'kelvin': ['kelvin', 'K']
        },
        convertibleUnits: ['celsius', 'fahrenheit', 'kelvin']
    },
    'Volume': {
        units: {
            'liters': ['liter', 'L', 'liters'],
            'gallons': ['gallon', 'gal', 'gallons'],
            'cubic-meter': ['cubic meter', 'm³', 'm3'],
        },
        convertibleUnits: ['liters', 'gallons', 'cubic-meters']
    },
    'Area': {
        units: {
            'acres': ['acres', 'acres'],
            'square-feet': ['square foot', 'ft²', 'ft2', 'square feet'],
            'square-meters': ['square-meters', 'm²', 'm2', 'square-meters']
        },
        convertibleUnits: ['acres', 'square-feet', 'square-meters']
    },
    'Speed': {
        units: {
            'kilometer-per-hour': ['kilometer per hour', 'km/h', 'kph'],
            'miles-per-hour': ['mile per hour', 'mph'],
            'meter-per-seconds': ['meter per second', 'm/s']
        },
        convertibleUnits: ['kilometer-per-hour', 'miles-per-hour', 'meter-per-seconds']
    },
    'Time': {
        units: {
            'seconds': ['second', 's', 'seconds'],
            'minutes': ['minute', 'min', 'minutes'],
            'hours': ['hour', 'hr', 'hours'],
            'days': ['day', 'd', 'days']
        },
        convertibleUnits: ['seconds', 'minutes', 'hours', 'days']
    },
    'Currency': {
        units: {
            'USD': ['usd', 'US dollar', 'dollar', '$'],
            'EUR': ['eur', 'euro', '€'],
            'CAD': ['cad', 'Canadian dollar', 'C$'],
            'GBP': ['gbp', 'British pound', 'pound', '£'],
            'JPY': ['jpy', 'Japanese yen', 'yen', '¥']
        },
        convertibleUnits: ['USD', 'EUR', 'CAD', 'GBP', 'JPY']
    }
};

// Function to normalize unit input (lowercase, trim spaces)
function normalizeUnit(unit) {
    return unit.toLowerCase().trim();
}

// Function to search for units that start with the input string
function searchUnits(input) {
    const normalizedInput = normalizeUnit(input);
    const matchingUnits = [];

    for (let category in unitCategories) {
        const units = unitCategories[category].units;
        for (let standardUnit in units) {
            const aliases = units[standardUnit];
            if (aliases.some(alias => normalizeUnit(alias).startsWith(normalizedInput))) {
                const shortAlias = aliases.find(alias => alias.length <= 3 && alias !== standardUnit) || standardUnit;
                matchingUnits.push({ standardUnit, shortAlias, category });
            }
        }
    }

    return matchingUnits;
}

// Function to find the standard unit name and its category (for exact match)
function getStandardUnitAndCategory(unit) {
    unit = normalizeUnit(unit);
    for (let category in unitCategories) {
        const units = unitCategories[category].units;
        for (let standardUnit in units) {
            if (units[standardUnit].includes(unit)) {
                const shortAlias = units[standardUnit].find(alias => alias.length <= 3 && alias !== standardUnit) || standardUnit;
                return { standardUnit, shortAlias, category };
            }
        }
    }
    return null;
}

// Function to check both units and display feedback

function checkUnits() {
    const fromUnit = document.getElementById('fromUnit').value;
    const toUnit = document.getElementById('toUnit').value;
    const feedbackDiv = document.getElementById('feedback');
    const conversionsDiv = document.getElementById('conversions');
    const categoryInfoDiv = document.getElementById('categoryInfo');

    // Clear previous feedback
    feedbackDiv.innerHTML = '';
    feedbackDiv.className = 'feedback';
    conversionsDiv.innerHTML = '';
    categoryInfoDiv.innerHTML = '';

    // If "From Unit" is empty, show default message
    if (!fromUnit) {
        categoryInfoDiv.innerHTML = '<h3>All Conversions: (provide both units)</h3>';
        return;
    }

    // Search for units that start with the "From Unit" input
    const matchingUnits = searchUnits(fromUnit);
    if (matchingUnits.length === 0) {
        feedbackDiv.innerHTML = `No units found starting with "${fromUnit}"`;
        feedbackDiv.className = 'feedback invalid';
        categoryInfoDiv.innerHTML = '<h3>All Conversions: (provide both units)</h3>';
        return;
    }

    // If "To Unit" is empty, show all possible conversions for all matching units
    if (!toUnit) {
        let conversionsHTML = '<h3>Popular Conversions:</h3><ul>';
        matchingUnits.forEach(unitInfo => {
            const { standardUnit, shortAlias, category } = unitInfo;
            const convertibleUnits = unitCategories[category].convertibleUnits;
            const unitsToConvertTo = convertibleUnits.filter(u => u !== standardUnit);

            unitsToConvertTo.forEach(targetUnit => {
                const targetUnitInfo = getStandardUnitAndCategory(targetUnit);
                const targetShortAlias = targetUnitInfo ? targetUnitInfo.shortAlias : targetUnit;
                const selectionName = `${standardUnit}-to-${targetUnit}`;
                conversionsHTML += `<li onclick="switchTab('${category}', '${selectionName}')"><a href="#converter">${shortAlias} to ${targetShortAlias}</a></li>`;
            });

        });
        conversionsHTML += '</ul>';
        conversionsDiv.innerHTML = conversionsHTML;

        categoryInfoDiv.innerHTML = '<h3>All Conversions: (provide both units)</h3>';
        return;
    }

    // Validate "From Unit" for an exact match when "To Unit" is provided
    const fromUnitInfo = getStandardUnitAndCategory(fromUnit);
    if (!fromUnitInfo) {
        feedbackDiv.innerHTML = `Unit "${fromUnit}" does not exist`;
        feedbackDiv.className = 'feedback invalid';
        categoryInfoDiv.innerHTML = '<h3>All Conversions: (provide both units)</h3>';
        return;
    }

    const { standardUnit: standardFromUnit, shortAlias: fromShortAlias, category: fromCategory } = fromUnitInfo;

    // Validate "To Unit"
    const toUnitInfo = getStandardUnitAndCategory(toUnit);
    if (!toUnitInfo) {
        feedbackDiv.innerHTML = `Unit "${toUnit}" does not exist`;
        feedbackDiv.className = 'feedback invalid';
        categoryInfoDiv.innerHTML = '<h3>All Conversions: (provide both units)</h3>';
        return;
    }

    const { standardUnit: standardToUnit, shortAlias: toShortAlias, category: toCategory } = toUnitInfo;

    // Check if both units are in the same category
    if (fromCategory === toCategory) {
        // Show the specific conversion pair in "Popular Conversions"
        let conversionsHTML = '<h3>Popular Conversions:</h3><ul>';
        const selectionName = `${standardFromUnit}-to-${standardToUnit}`;
        conversionsHTML += `<li onclick="switchTab('${fromCategory}', '${selectionName}')">${fromShortAlias} to ${toShortAlias}</li>`;
        conversionsHTML += '</ul>';
        conversionsDiv.innerHTML = conversionsHTML;

        // Show the confirmation in "All Conversions"
        categoryInfoDiv.innerHTML = `<h3>All Conversions: (provide both units)</h3>${standardFromUnit} [${fromShortAlias}] to ${standardToUnit} [${toShortAlias}] ${fromCategory}`;
    } else {
        feedbackDiv.innerHTML = `Cannot convert: units are not compatible (${fromCategory} to ${toCategory})`;
        feedbackDiv.className = 'feedback invalid';
        categoryInfoDiv.innerHTML = '<h3>All Conversions: (provide both units)</h3>';
    }
}

const images = document.querySelectorAll('.table img');
const overlay = document.getElementById('overlay');
const zoomedImg = document.getElementById('zoomedImg');
const closeBtn = document.getElementById('closeBtn');

// Open image in overlay when clicked
images.forEach(image => {
    image.addEventListener('click', () => {
        zoomedImg.src = image.src;
        zoomedImg.alt = image.alt;
        overlay.classList.add('active');
    });
});

// Close overlay when close button is clicked
closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
    zoomedImg.src = ''; // Clear image source
});

// Close overlay when clicking outside the image
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        overlay.classList.remove('active');
        zoomedImg.src = '';
    }
});

// Close overlay with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        zoomedImg.src = '';
    }
});