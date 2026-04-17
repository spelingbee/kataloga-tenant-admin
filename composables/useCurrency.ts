import { computed } from 'vue'

/**
 * Centralized currency management composable
 * Requirement: Manage currency from one place
 */
export const useCurrency = () => {
    // Current currency symbol - can be fetched from a store in the future
    const currencyCode = ref('KGS')
    
    // Formatting options
    const options = reactive({
        prefix: '', // Prefix before the amount
        suffix: ' KGS', // Suffix after the amount
        decimals: 2,
        thousandsSeparator: ' ',
        decimalSeparator: '.'
    })

    /**
     * Format a number as a currency string
     * @param amount The value to format
     * @returns Formatted string (e.g. "1 500.00 KGS")
     */
    const formatPrice = (amount: number | string | undefined | null): string => {
        if (amount === undefined || amount === null) return `0.00${options.suffix}`
        
        const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount
        if (isNaN(numericValue)) return `0.00${options.suffix}`

        const formattedNumber = numericValue.toFixed(options.decimals)
            .replace('.', options.decimalSeparator)
            .replace(/\B(?=(\d{3})+(?!\d))/g, options.thousandsSeparator)

        return `${options.prefix}${formattedNumber}${options.suffix}`
    }

    /**
     * Alias for formatPrice (for compatibility)
     */
    const formatCurrency = formatPrice

    /**
     * Format currency in compact form (e.g. "1.5K KGS")
     */
    const formatCompactCurrency = (amount: number | string | undefined | null): string => {
        if (amount === undefined || amount === null) return `0${options.suffix}`
        
        const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount
        if (isNaN(numericValue)) return `0${options.suffix}`

        const absValue = Math.abs(numericValue)
        let formatted: string

        if (absValue >= 1000000) {
            formatted = (numericValue / 1000000).toFixed(1) + 'M'
        } else if (absValue >= 1000) {
            formatted = (numericValue / 1000).toFixed(1) + 'K'
        } else {
            formatted = numericValue.toFixed(0)
        }

        return `${options.prefix}${formatted}${options.suffix}`
    }

    /**
     * Raw currency symbol/code for input prefixes/suffixes
     */
    const symbol = computed(() => currencyCode.value)
    const suffix = computed(() => options.suffix.trim())

    return {
        formatPrice,
        formatCurrency,
        formatCompactCurrency,
        symbol,
        suffix,
        currencyCode
    }
}
