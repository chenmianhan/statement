function calculateThisAmountPerPerformance(play, thisAmount, perf) {
    switch (play.type) {
        case 'tragedy':
            thisAmount = 40000;
            if (perf.audience > 30) {
                thisAmount += 1000 * (perf.audience - 30);
            }
            break;
        case 'comedy':
            thisAmount = 30000;
            if (perf.audience > 20) {
                thisAmount += 10000 + 500 * (perf.audience - 20);
            }
            thisAmount += 300 * perf.audience;
            break;
        default:
            throw new Error(`unknown type: ${play.type}`);
    }
    return thisAmount;
}

function calculateVolumeCredits(perf) {
    return Math.max(perf.audience - 30, 0);
}

function calculateExtraCreditForEveryTenComedyAttendees(perf) {
    return Math.floor(perf.audience / 5);
}

function generateFormat() {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format;
}

function calculateTotalVolumeCredits(invoice, plays) {
    let volumeCredits = 0;
    for (let perf of invoice.performances) {
        const play = plays[perf.playID];
        volumeCredits += calculateVolumeCredits(perf);
        if ('comedy' === play.type) volumeCredits += calculateExtraCreditForEveryTenComedyAttendees(perf);
    }
    return volumeCredits;
}

function generateAmountAndSeatData(statementData, result, format) {
    for (let performanceAmountData of statementData.performanceAmountDataArray) {
        result += ` ${performanceAmountData.playName}: ${format(performanceAmountData.thisAmount / 100)} (${performanceAmountData.audience} seats)\n`;
    }
    return result;
}

function calculateTotalAmount(invoice, plays) {
    let totalAmount = 0;
    for (let perf of invoice.performances) {
        const play = plays[perf.playID];
        let thisAmount = 0;
        thisAmount = calculateThisAmountPerPerformance(play, thisAmount, perf);
        totalAmount += thisAmount;
    }
    return totalAmount;
}

function generateFirstLineOfStatement(customer) {
    return `Statement for ${customer}\n`;
}

function generateTotalAmountLine(result, format, totalAmount) {
    result += `Amount owed is ${format(totalAmount / 100)}\n`;
    return result;
}

function generateVolumeCredits(volumeCredits) {
    return `You earned ${volumeCredits} credits \n`;
}

function generatePlainText(statementData) {
    let result = generateFirstLineOfStatement(statementData.customer);
    result = generateAmountAndSeatData(statementData, result, generateFormat());
    result = generateTotalAmountLine(result, generateFormat(), statementData.totalAmount);
    result += generateVolumeCredits(statementData.volumeCredits);
    return result;
}

function createStatementData(invoice, plays) {
    let statementData = {}
    let totalAmount = calculateTotalAmount(invoice, plays);
    let volumeCredits = calculateTotalVolumeCredits(invoice, plays);
    statementData.totalAmount = totalAmount;
    statementData.volumeCredits = volumeCredits;
    statementData.performanceAmountDataArray = createPerformanceAmountDataArray(invoice, plays);
    statementData.customer = invoice.customer;
    return statementData;
}

function createPerformanceAmountDataArray(invoice, plays) {
    let performanceAmountDataArray = [];
    for (let perf of invoice.performances) {
        const play = plays[perf.playID];
        let thisAmount = 0;
        thisAmount = calculateThisAmountPerPerformance(play, thisAmount, perf);
        let performanceAmountData = {}
        performanceAmountData.playName = play.name;
        performanceAmountData.thisAmount = thisAmount;
        performanceAmountData.audience = perf.audience;
        performanceAmountDataArray.push(performanceAmountData);
    }
    return performanceAmountDataArray;
}

function statement(invoice, plays) {
    return generatePlainText(createStatementData(invoice, plays));
}

module.exports = {
    statement,
};
