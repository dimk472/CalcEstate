// formulas.ts
import { CalculateRatiosPropsArray } from "./ratios";

// Create a type for the CalculateRatiosProps item
export type CalculateRatiosItem = typeof CalculateRatiosPropsArray[0];

export interface Formula {
    id: string;
    formula: (item: CalculateRatiosItem) => number;
}

export const formulas: Record<number, Formula> = {
    1: {
        id: '1',
        formula: (item) => {
            const annualRentalIncome = item.inputValues.annualRentalIncome as number;
            const propertyPrice = item.inputValues.propertyPrice as number;
            if (!propertyPrice || propertyPrice === 0) return 0;
            return (annualRentalIncome / propertyPrice) * 100;
        }
    },
    2: {
        id: '2',
        formula: (item) => {
            const annualRentalIncome = item.inputValues.annualRentalIncome as number;
            const annualExpenses = item.inputValues.annualExpenses as number;
            const propertyPrice = item.inputValues.propertyPrice as number;
            if (!propertyPrice || propertyPrice === 0) return 0;
            const netIncome = annualRentalIncome - annualExpenses;
            return (netIncome / propertyPrice) * 100;
        }
    },
    3: {
        id: '3',
        formula: (item) => {
            const propertyPrice = item.inputValues.propertyPrice as number;
            const totalArea = item.inputValues.totalArea as number;
            if (!totalArea || totalArea === 0) return 0;
            return propertyPrice / totalArea;
        }
    },
    4: {
        id: '4',
        formula: (item) => {
            const monthlyRent = item.inputValues.monthlyRent as number;
            const totalArea = item.inputValues.totalArea as number;
            if (!totalArea || totalArea === 0) return 0;
            return monthlyRent / totalArea;
        }
    },
    5: {
        id: '5',
        formula: (item) => {
            const annualRentalIncome = item.inputValues.annualRentalIncome as number;
            const operatingExpenses = item.inputValues.operatingExpenses as number;
            return annualRentalIncome - operatingExpenses;
        }
    },
    6: {
        id: '6',
        formula: (item) => {
            const annualRentalIncome = item.inputValues.annualRentalIncome as number;
            const annualExpenses = item.inputValues.annualExpenses as number;
            const annualLoanPayments = item.inputValues.annualLoanPayments as number;
            return (annualRentalIncome - annualExpenses) - annualLoanPayments;
        }
    },
    7: {
        id: '7',
        formula: (item) => {
            const operatingExpenses = item.inputValues.operatingExpenses as number;
            const annualRentalIncome = item.inputValues.annualRentalIncome as number;
            if (!annualRentalIncome || annualRentalIncome === 0) return 0;
            return (operatingExpenses / annualRentalIncome) * 100;
        }
    },
    8: {
        id: '8',
        formula: (item) => {
            const annualRentalIncome = item.inputValues.annualRentalIncome as number;
            const annualExpenses = item.inputValues.annualExpenses as number;
            const propertyValue = item.inputValues.propertyValue as number;
            if (!propertyValue || propertyValue === 0) return 0;
            const noi = annualRentalIncome - annualExpenses;
            return (noi / propertyValue) * 100;
        }
    },
    9: {
        id: '9',
        formula: (item) => {
            const annualRentalIncome = item.inputValues.annualRentalIncome as number;
            const annualExpenses = item.inputValues.annualExpenses as number;
            const annualLoanPayments = item.inputValues.annualLoanPayments as number;
            const cashInvested = item.inputValues.cashInvested as number;
            if (!cashInvested || cashInvested === 0) return 0;
            const cashFlow = (annualRentalIncome - annualExpenses) - annualLoanPayments;
            return (cashFlow / cashInvested) * 100;
        }
    },
    10: {
        id: '10',
        formula: (item) => {
            const loanAmount = item.inputValues.loanAmount as number;
            const propertyValue = item.inputValues.propertyValue as number;
            if (!propertyValue || propertyValue === 0) return 0;
            return (loanAmount / propertyValue) * 100;
        }
    },
    11: {
        id: '11',
        formula: (item) => {
            const annualRentalIncome = item.inputValues.annualRentalIncome as number;
            const annualExpenses = item.inputValues.annualExpenses as number;
            const annualLoanPayments = item.inputValues.annualLoanPayments as number;
            if (!annualLoanPayments || annualLoanPayments === 0) return 0;
            const noi = annualRentalIncome - annualExpenses;
            return noi / annualLoanPayments;
        }
    },
    12: {
        id: '12',
        formula: (item) => {
            const daysRented = item.inputValues.daysRented as number;
            const totalDays = item.inputValues.totalDays as number;
            if (!totalDays || totalDays === 0) return 0;
            return (daysRented / totalDays) * 100;
        }
    },
    13: {
        id: '13',
        formula: (item) => {
            const daysVacant = item.inputValues.daysVacant as number;
            const totalDays = item.inputValues.totalDays as number;
            if (!totalDays || totalDays === 0) return 0;
            return (daysVacant / totalDays) * 100;
        }
    },
    14: {
        id: '14',
        formula: (item) => {
            const propertyPrice = item.inputValues.propertyPrice as number;
            const annualRentalIncome = item.inputValues.annualRentalIncome as number;
            if (!annualRentalIncome || annualRentalIncome === 0) return 0;
            return propertyPrice / annualRentalIncome;
        }
    },
    15: {
        id: '15',
        formula: (item) => {
            const annualRentalIncome = item.inputValues.annualRentalIncome as number;
            const annualExpenses = item.inputValues.annualExpenses as number;
            const loanAmount = item.inputValues.loanAmount as number;
            if (!loanAmount || loanAmount === 0) return 0;
            const noi = annualRentalIncome - annualExpenses;
            return (noi / loanAmount) * 100;
        }
    },
    16: {
        id: '16',
        formula: (item) => {
            const annualRentalIncome = item.inputValues.annualRentalIncome as number;
            const operatingExpenses = item.inputValues.operatingExpenses as number;
            const annualLoanPayments = item.inputValues.annualLoanPayments as number;
            if (!annualRentalIncome || annualRentalIncome === 0) return 0;
            return ((operatingExpenses + annualLoanPayments) / annualRentalIncome) * 100;
        }
    },
    17: {
        id: '17',
        formula: (item) => {
            const monthlyRent = item.inputValues.monthlyRent as number;
            const propertyPrice = item.inputValues.propertyPrice as number;
            if (!propertyPrice || propertyPrice === 0) return 0;
            return (monthlyRent / propertyPrice) * 100;
        }
    },
    18: {
        id: '18',
        formula: (item) => {
            const annualCashFlow = item.inputValues.annualCashFlow as number;
            const cashInvested = item.inputValues.cashInvested as number;
            if (!cashInvested || cashInvested === 0) return 0;
            return (annualCashFlow / cashInvested) * 100;
        }
    },
    19: {
        id: '19',
        formula: (item) => {
            // Simplified IRR calculation - in practice you'd want a proper IRR function
            const cashFlows = item.inputValues.cashFlows as number[];
            const initialInvestment = item.inputValues.initialInvestment as number;

            if (!cashFlows || cashFlows.length === 0) return 0;

            // Simple average return for demo purposes
            // In real implementation, use proper IRR algorithm
            const totalCashFlow = cashFlows.reduce((sum, flow) => sum + flow, 0);
            const averageAnnualCashFlow = totalCashFlow / cashFlows.length;

            if (!initialInvestment || initialInvestment === 0) return 0;
            return (averageAnnualCashFlow / initialInvestment) * 100;
        }
    },
    20: {
        id: '20',
        formula: (item) => {
            const operatingExpenses = item.inputValues.operatingExpenses as number;
            const propertyValue = item.inputValues.propertyValue as number;
            if (!propertyValue || propertyValue === 0) return 0;
            return (operatingExpenses / propertyValue) * 100;
        }
    },
    21: {
        id: '21',
        formula: (item) => {
            const grossProfit = item.inputValues.grossProfit as number;
            const revenue = item.inputValues.revenue as number;
            if (!revenue || revenue === 0) return 0;
            return (grossProfit / revenue) * 100;
        }
    }
};

export default formulas;

// Helper function to calculate any ratio
export function calculateRatio(id: number, item: CalculateRatiosItem): number {
    const formula = formulas[id];
    if (!formula) {
        console.warn(`No formula found for ratio ID: ${id}`);
        return 0;
    }
    return formula.formula(item);
}

// Helper function to calculate all ratios at once
export function calculateAllRatios(item: CalculateRatiosItem): Record<number, number> {
    const results: Record<number, number> = {};

    for (const [id, formula] of Object.entries(formulas)) {
        results[parseInt(id)] = formula.formula(item);
    }

    return results;
}