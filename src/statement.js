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

function calculateTotalVolumeCredits(invoice, plays, volumeCredits) {
    for (let perf of invoice.performances) {
        const play = plays[perf.playID];
        volumeCredits += calculateVolumeCredits(perf);
        if ('comedy' === play.type) volumeCredits += calculateExtraCreditForEveryTenComedyAttendees(perf);
    }
    return volumeCredits;
}

function generateAmountAndSeatData(invoice, plays, result, format) {
    for (let perf of invoice.performances) {
        const play = plays[perf.playID];
        let thisAmount = 0;
        thisAmount = calculateThisAmountPerPerformance(play, thisAmount, perf);
        result += ` ${play.name}: ${format(thisAmount / 100)} (${perf.audience} seats)\n`;
    }
    return result;
}

function calculateTotalAmount(invoice, plays, totalAmount) {
    for (let perf of invoice.performances) {
        const play = plays[perf.playID];
        let thisAmount = 0;
        thisAmount = calculateThisAmountPerPerformance(play, thisAmount, perf);
        totalAmount += thisAmount;
    }
    return totalAmount;
}

function generateFirstLineOfStatement(invoice) {
    return `Statement for ${invoice.customer}\n`;
}

function statement(invoice, plays) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = generateFirstLineOfStatement(invoice);
    const format = generateFormat();

    totalAmount = calculateTotalAmount(invoice, plays, totalAmount);
    result = generateAmountAndSeatData(invoice, plays, result, format);
    volumeCredits = calculateTotalVolumeCredits(invoice, plays, volumeCredits);
    result += `Amount owed is ${format(totalAmount / 100)}\n`;
    result += `You earned ${volumeCredits} credits \n`;
    return result;
}

module.exports = {
    statement,
};
