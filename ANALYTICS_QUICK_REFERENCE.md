# Sales Analytics Dashboard - Quick Reference

## Overview
The Sales Analytics Dashboard provides comprehensive insights into your restaurant's sales performance, helping you make data-driven decisions.

## Access Requirements
- **Plan**: PRO or BUSINESS plan required
- **Role**: TENANT_ADMIN or TENANT_STAFF
- **Feature**: `SALES_ANALYTICS` feature must be enabled

## Features

### 1. Overview Metrics
Three key performance indicators displayed at the top:
- **Total Revenue**: Sum of all sales for the selected period
- **Total Orders**: Number of orders placed
- **Average Order Value**: Revenue divided by number of orders

### 2. Date Range Selector
Filter analytics data by custom date range:
- **Start Date**: Beginning of the period
- **End Date**: End of the period
- **Default**: Last 30 days

### 3. Period Selector
View sales trends aggregated by:
- **Daily**: Day-by-day breakdown
- **Weekly**: Week-by-week breakdown
- **Monthly**: Month-by-month breakdown

### 4. Sales Trend Chart
Interactive line chart showing revenue over time:
- **Hover**: View exact revenue and order count for each data point
- **Gradient Fill**: Visual representation of revenue area
- **Responsive**: Adapts to screen size

### 5. Top Selling Items
Ranked list of best-performing menu items:
- **Rank Badges**: Gold (1st), Silver (2nd), Bronze (3rd)
- **Quantity Sold**: Number of items sold
- **Revenue**: Total revenue generated
- **Visual Bars**: Proportional revenue representation

### 6. Category Performance
Horizontal bar chart showing revenue by category:
- **Color Coding**: 
  - Green: High performers (80%+ of max)
  - Blue: Good performers (50-80%)
  - Orange: Moderate performers (30-50%)
  - Gray: Low performers (<30%)
- **Item Count**: Number of items in each category
- **Summary Stats**: Total categories, total revenue, average per category

### 7. Export Data (BUSINESS Plan Only)
Export sales data for external analysis:
- **Format**: CSV (Excel support coming soon)
- **Content**: All sales transactions with details
- **Filename**: `sales-export-YYYY-MM-DD.csv`

## Usage Guide

### Viewing Analytics
1. Navigate to `/analytics` from the dashboard
2. If you have PRO/BUSINESS plan, you'll see the full dashboard
3. If you have FREE plan, you'll see an upgrade prompt

### Filtering Data
1. **Select Date Range**:
   - Click on the start date input
   - Choose your desired start date
   - Click on the end date input
   - Choose your desired end date
   - Data automatically refreshes

2. **Change Period**:
   - Click the period dropdown
   - Select Daily, Weekly, or Monthly
   - Sales trend chart updates automatically

### Exporting Data (BUSINESS Plan)
1. Set your desired date range
2. Click the "Export Data" button
3. File will download automatically
4. Open in Excel or Google Sheets for further analysis

### Interpreting Charts

#### Sales Trend Chart
- **Upward Trend**: Sales are increasing
- **Downward Trend**: Sales are decreasing
- **Flat Line**: Sales are stable
- **Spikes**: Unusual high sales days (promotions, events)
- **Dips**: Unusual low sales days (holidays, closures)

#### Top Selling Items
- **Top 3**: Your star performers - ensure always in stock
- **Middle Range**: Consistent sellers - maintain quality
- **Bottom Range**: Consider promotions or menu changes

#### Category Performance
- **High Performers**: Focus on expanding these categories
- **Low Performers**: Analyze why and consider improvements
- **Balanced**: Good menu diversity

## Tips for Better Insights

### 1. Compare Periods
- View last 7 days vs previous 7 days
- Compare same month year-over-year
- Identify seasonal trends

### 2. Monitor Trends
- Check daily for immediate issues
- Review weekly for short-term patterns
- Analyze monthly for strategic planning

### 3. Take Action
- **High Revenue Days**: Analyze what worked, replicate success
- **Low Revenue Days**: Identify causes, implement improvements
- **Top Items**: Ensure adequate inventory, consider upselling
- **Low Items**: Run promotions, improve recipes, or remove

### 4. Use with Other Data
- Combine with customer feedback
- Cross-reference with inventory data
- Correlate with marketing campaigns

## Troubleshooting

### "Feature not available" Error
- **Cause**: You're on the FREE plan
- **Solution**: Upgrade to PRO or BUSINESS plan

### "No data available"
- **Cause**: No sales recorded for selected period
- **Solution**: 
  - Check date range
  - Verify sales are being recorded
  - Contact support if issue persists

### Charts not loading
- **Cause**: Network issue or server error
- **Solution**:
  - Refresh the page
  - Check internet connection
  - Try again in a few minutes

### Export button not visible
- **Cause**: You're on PRO plan (export requires BUSINESS)
- **Solution**: Upgrade to BUSINESS plan

## Keyboard Shortcuts
- **R**: Refresh data
- **E**: Export data (BUSINESS plan only)
- **Esc**: Close any open modals

## Mobile Usage
The analytics dashboard is fully responsive:
- **Portrait Mode**: Stacked layout for easy scrolling
- **Landscape Mode**: Side-by-side charts when possible
- **Touch**: Tap data points to view details
- **Pinch**: Zoom in on charts for better visibility

## Best Practices

### Daily Review
- Check overview metrics
- Identify any unusual patterns
- Address immediate issues

### Weekly Analysis
- Review top-selling items
- Analyze category performance
- Plan inventory accordingly

### Monthly Planning
- Identify long-term trends
- Make strategic menu decisions
- Set goals for next month

### Quarterly Strategy
- Export data for deep analysis
- Compare quarter-over-quarter
- Plan major menu changes

## API Endpoints Used
For developers integrating with the analytics:

```
GET /analytics/overview
GET /analytics/sales?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&period=daily
GET /analytics/top-items?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=10
GET /analytics/category-performance?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /analytics/export?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&format=csv
```

## Support
For questions or issues:
- Check this guide first
- Review the main documentation
- Contact support at support@example.com
- Visit help center at /help

## Related Features
- **Menu Item Sales History**: View detailed sales for individual items
- **Subscription Management**: Upgrade your plan for more features
- **Audit Trail**: Track changes to menu items (PRO/BUSINESS)
- **Advanced Reporting**: Generate custom reports (BUSINESS)

## Coming Soon
- Real-time updates
- Comparison mode (period vs period)
- Predictive analytics
- Custom date presets (last 7 days, last month, etc.)
- PDF export
- Scheduled email reports
- Mobile app

---

**Last Updated**: November 2024
**Version**: 1.0.0
