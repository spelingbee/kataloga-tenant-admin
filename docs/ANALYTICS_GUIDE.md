# Sales Analytics Guide (PRO/BUSINESS)

> **Note**: Sales analytics are available on PRO and BUSINESS plans only.

Complete guide to tracking and analyzing your restaurant's sales performance.

---

## Overview

Sales analytics help you:
- Track revenue and sales trends
- Identify top-performing items
- Understand category performance
- Make data-driven menu decisions
- Optimize pricing and offerings

---

## Plan Availability

| Feature | FREE | PRO | BUSINESS |
|---------|------|-----|----------|
| Sales Dashboard | ✗ | ✓ | ✓ |
| Revenue Tracking | ✗ | ✓ | ✓ |
| Top Items Report | ✗ | ✓ | ✓ |
| Category Performance | ✗ | ✓ | ✓ |
| Sales Trends | ✗ | ✓ | ✓ |
| Item Sales History | ✗ | ✓ | ✓ |
| Basic Export (CSV) | ✗ | ✓ | ✗ |
| Advanced Export (PDF/Excel) | ✗ | ✗ | ✓ |
| Custom Reports | ✗ | ✗ | ✓ |
| API Access | ✗ | ✗ | ✓ |

---

## Quick Start

1. Navigate to **Analytics** in sidebar
2. View sales dashboard
3. Select date range
4. Filter by location (if multi-location)
5. Explore charts and reports
6. Export data (BUSINESS plan)

---

## Sales Dashboard

### Overview Metrics

```
┌─────────────────────────────────────────────────┐
│  Sales Analytics                                 │
│  Last 30 Days                    [Date Range ▼] │
├─────────────────────────────────────────────────┤
│  Total Revenue        Orders        Avg Order    │
│  $12,456.78          456           $27.32        │
│  +15.3% ↑            +8.2% ↑       +6.5% ↑      │
└─────────────────────────────────────────────────┘
```

**Key Metrics:**
- **Total Revenue**: Sum of all sales
- **Orders**: Number of transactions
- **Average Order**: Revenue ÷ Orders
- **Growth**: Comparison to previous period

### Date Range Selection

**Preset Ranges:**
- Today
- Yesterday
- Last 7 Days
- Last 30 Days
- Last 90 Days
- This Month
- Last Month
- This Year
- Custom Range

**Custom Range:**
```
From: [MM/DD/YYYY]
To:   [MM/DD/YYYY]
[Apply]
```

### Location Filter (Multi-Location)

```
Location: [All Locations ▼]
          - All Locations
          - Downtown Branch
          - Uptown Location
          - Airport Kiosk
```

---

## Top-Selling Items

### Top Items Chart

```
┌─────────────────────────────────────────────────┐
│  Top 10 Selling Items                            │
├─────────────────────────────────────────────────┤
│  1. Margherita Pizza                             │
│     ████████████████████ 89 sold  •  $1,156.11  │
│                                                  │
│  2. Caesar Salad                                 │
│     ████████████████ 67 sold  •  $602.33        │
│                                                  │
│  3. Grilled Salmon                               │
│     ██████████████ 54 sold  •  $1,237.46        │
│                                                  │
│  4. Tiramisu                                     │
│     ████████████ 48 sold  •  $335.52            │
│                                                  │
│  5. Cappuccino                                   │
│     ██████████ 42 sold  •  $168.00              │
└─────────────────────────────────────────────────┘
```

**Metrics per Item:**
- Quantity sold
- Total revenue
- Percentage of total sales
- Growth vs. previous period

### Sorting Options

- By Quantity (most sold)
- By Revenue (highest revenue)
- By Growth (fastest growing)
- By Profit Margin (if configured)

### Item Details

Click on an item to see:
- Detailed sales history
- Sales trend chart
- Revenue breakdown
- Customer ratings (if available)
- Inventory status

---

## Category Performance

### Category Breakdown

```
┌─────────────────────────────────────────────────┐
│  Category Performance                            │
├─────────────────────────────────────────────────┤
│  Main Courses        $5,234.56  (42%)            │
│  ████████████████████████████████████████        │
│                                                  │
│  Appetizers          $2,456.78  (20%)            │
│  ████████████████████                            │
│                                                  │
│  Desserts            $1,890.12  (15%)            │
│  ███████████████                                 │
│                                                  │
│  Beverages           $1,567.89  (13%)            │
│  █████████████                                   │
│                                                  │
│  Specials            $1,234.56  (10%)            │
│  ██████████                                      │
└─────────────────────────────────────────────────┘
```

**Metrics per Category:**
- Total revenue
- Percentage of total
- Number of items sold
- Average item price
- Growth trend

### Category Insights

**High Performers:**
- Categories with >30% of revenue
- Growing categories (+10% or more)
- High-margin categories

**Underperformers:**
- Categories with <5% of revenue
- Declining categories (-10% or more)
- Low-margin categories

**Recommendations:**
```
💡 Insights:
• Main Courses driving 42% of revenue
• Desserts growing 23% vs. last period
• Consider expanding Appetizers menu
• Beverages underperforming - review pricing
```

---

## Sales Trends

### Trend Chart

```
┌─────────────────────────────────────────────────┐
│  Sales Trend                                     │
│  [Daily] [Weekly] [Monthly]                      │
├─────────────────────────────────────────────────┤
│  $600 │                                    ╱╲    │
│       │                              ╱╲   ╱  ╲   │
│  $400 │                        ╱╲   ╱  ╲╱    ╲  │
│       │                  ╱╲   ╱  ╲╱            ╲ │
│  $200 │            ╱╲   ╱  ╲╱                    │
│       │      ╱╲   ╱  ╲╱                          │
│    $0 └────────────────────────────────────────│
│        Mon  Tue  Wed  Thu  Fri  Sat  Sun        │
└─────────────────────────────────────────────────┘
```

**View Options:**
- **Daily**: Shows each day
- **Weekly**: Shows each week
- **Monthly**: Shows each month

**Trend Analysis:**
- Peak days/times
- Seasonal patterns
- Growth trajectory
- Anomalies

### Pattern Recognition

**Common Patterns:**

**Weekend Peak:**
```
Mon-Thu: $300-400/day
Fri-Sun: $500-600/day
→ Increase weekend staffing
```

**Lunch Rush:**
```
11am-2pm: 60% of daily sales
→ Optimize lunch menu
```

**Seasonal Variation:**
```
Summer: +25% revenue
Winter: -15% revenue
→ Adjust inventory seasonally
```

---

## Menu Item Sales History

### Viewing Item History

1. Go to Menu
2. Click on menu item
3. Scroll to "Sales History"
4. Or go to Analytics → Item History

### Item History View

```
┌─────────────────────────────────────────────────┐
│  Margherita Pizza - Sales History                │
│  Last 30 Days                    [Date Range ▼] │
├─────────────────────────────────────────────────┤
│  Total Sold: 89 units                            │
│  Total Revenue: $1,156.11                        │
│  Average Price: $12.99                           │
│  Growth: +15.3% ↑                                │
│                                                  │
│  Sales Trend:                                    │
│  [Chart showing daily sales]                     │
│                                                  │
│  Daily Breakdown:                                │
│  Nov 26: 4 sold  •  $51.96                      │
│  Nov 25: 3 sold  •  $38.97                      │
│  Nov 24: 5 sold  •  $64.95                      │
│  Nov 23: 2 sold  •  $25.98                      │
│  ...                                             │
│                                                  │
│  [Export CSV] (BUSINESS: [Export PDF/Excel])    │
└─────────────────────────────────────────────────┘
```

### Comparing Items

**Side-by-Side Comparison:**
```
┌─────────────────────────────────────────────────┐
│  Compare Items                                   │
├─────────────────────────────────────────────────┤
│                Pizza    Pasta    Salmon          │
│  Units Sold    89       67       54              │
│  Revenue       $1,156   $938     $1,237          │
│  Avg Price     $12.99   $14.00   $22.90          │
│  Growth        +15%     +8%      -3%             │
└─────────────────────────────────────────────────┘
```

---

## Exporting Data

### CSV Export (PRO Plan)

**What's Included:**
- Sales transactions
- Item details
- Revenue totals
- Date/time stamps

**Export Process:**
1. Go to Analytics
2. Select date range
3. Click **"Export CSV"**
4. File downloads automatically

**CSV Format:**
```
Date,Item,Quantity,Price,Total,Category,Location
2025-11-26,Margherita Pizza,4,$12.99,$51.96,Main Courses,Downtown
2025-11-26,Caesar Salad,3,$8.99,$26.97,Appetizers,Downtown
...
```

### Advanced Export (BUSINESS Plan)

**Additional Formats:**
- **PDF**: Formatted reports with charts
- **Excel**: Spreadsheets with formulas
- **CSV**: Raw data

**Export Options:**
```
┌─────────────────────────────────────┐
│  Export Sales Data                   │
├─────────────────────────────────────┤
│  Format:                             │
│  ○ PDF Report                        │
│  ○ Excel Spreadsheet                 │
│  ● CSV Data                          │
│                                      │
│  Date Range:                         │
│  From: [11/01/2025]                  │
│  To:   [11/30/2025]                  │
│                                      │
│  Include:                            │
│  ☑ Sales Summary                     │
│  ☑ Item Details                      │
│  ☑ Category Breakdown                │
│  ☑ Location Data                     │
│  ☑ Charts & Graphs                   │
│                                      │
│  [Cancel]  [Export]                  │
└─────────────────────────────────────┘
```

**PDF Report Features:**
- Executive summary
- Charts and graphs
- Detailed tables
- Insights and recommendations
- Branded header/footer

**Excel Features:**
- Multiple worksheets
- Pivot tables
- Formulas and calculations
- Charts
- Conditional formatting

---

## Custom Reports (BUSINESS Plan)

### Report Builder

Create custom reports:

**1. Select Report Type:**
- Sales Summary
- Item Performance
- Category Analysis
- Location Comparison
- Time-based Analysis
- Custom Query

**2. Choose Metrics:**
- Revenue
- Quantity sold
- Average order value
- Growth rate
- Profit margin
- Customer count

**3. Set Filters:**
- Date range
- Locations
- Categories
- Price range
- Item status

**4. Configure Display:**
- Chart type
- Sort order
- Grouping
- Aggregation

**5. Save & Schedule:**
- Save report template
- Schedule automatic generation
- Email delivery
- Export format

### Scheduled Reports

**Automatic Delivery:**
```
Report: Weekly Sales Summary
Schedule: Every Monday at 9:00 AM
Recipients: manager@restaurant.com
Format: PDF
Includes: Charts, top items, insights
```

---

## Analytics Best Practices

### Regular Review

**Daily:**
- Check today's sales
- Monitor top items
- Identify issues

**Weekly:**
- Review week's performance
- Compare to previous week
- Adjust inventory

**Monthly:**
- Analyze trends
- Review all categories
- Plan menu changes

**Quarterly:**
- Strategic review
- Seasonal planning
- Budget forecasting

### Data-Driven Decisions

**Menu Optimization:**
```
Analysis: Tiramisu sales down 20%
Action: Review recipe, pricing, or remove
Result: Monitor for 30 days
```

**Pricing Strategy:**
```
Analysis: Pizza high demand, low margin
Action: Increase price by $1
Result: Revenue up 8%, sales down 2%
```

**Inventory Management:**
```
Analysis: Salmon waste high
Action: Reduce par levels
Result: Waste down 30%
```

### Identifying Opportunities

**High Performers:**
- Promote more
- Create variations
- Bundle with other items
- Feature in specials

**Underperformers:**
- Improve recipe
- Adjust pricing
- Better description/photo
- Consider removal

**Gaps:**
- Missing price points
- Underserved categories
- Competitor offerings
- Customer requests

---

## Understanding Metrics

### Revenue

**Total Revenue:**
- Sum of all sales
- Before taxes and fees
- Gross sales figure

**Net Revenue:**
- After discounts
- After refunds
- Actual income

### Growth Rate

**Calculation:**
```
Growth = ((Current - Previous) / Previous) × 100

Example:
Current Period: $12,456
Previous Period: $10,832
Growth = ((12,456 - 10,832) / 10,832) × 100
Growth = 15.0%
```

**Interpreting Growth:**
- +10% or more: Strong growth
- +5% to +10%: Healthy growth
- 0% to +5%: Modest growth
- Negative: Decline (investigate)

### Average Order Value (AOV)

**Calculation:**
```
AOV = Total Revenue / Number of Orders

Example:
Revenue: $12,456
Orders: 456
AOV = $12,456 / 456 = $27.32
```

**Improving AOV:**
- Upselling
- Bundling
- Minimum order for delivery
- Loyalty rewards

### Conversion Rate

**Calculation:**
```
Conversion = (Orders / Visitors) × 100

Example:
Orders: 456
Visitors: 1,200
Conversion = (456 / 1,200) × 100 = 38%
```

---

## Troubleshooting

### No Data Showing

**Problem**: Analytics page is empty

**Solutions**:
1. Verify PRO/BUSINESS plan
2. Check date range
3. Ensure sales data exists
4. Refresh page
5. Clear browser cache

### Incorrect Numbers

**Problem**: Numbers don't match POS

**Check**:
1. Date range matches
2. Location filter correct
3. Timezone settings
4. Data sync status
5. Contact support

### Export Failed

**Problem**: Cannot export data

**Solutions**:
1. Reduce date range
2. Check internet connection
3. Try different format
4. Use different browser
5. Contact support

### Slow Loading

**Problem**: Analytics page loads slowly

**Solutions**:
1. Reduce date range
2. Clear browser cache
3. Close other tabs
4. Check internet speed
5. Try off-peak hours

---

## Advanced Analytics (BUSINESS)

### Predictive Analytics

**Sales Forecasting:**
- Predict future sales
- Based on historical data
- Seasonal adjustments
- Trend analysis

**Inventory Predictions:**
- Forecast demand
- Optimize stock levels
- Reduce waste
- Prevent stockouts

### Customer Analytics

**Customer Segmentation:**
- High-value customers
- Frequent buyers
- Occasional visitors
- At-risk customers

**Behavior Analysis:**
- Purchase patterns
- Favorite items
- Order frequency
- Lifetime value

### Competitive Analysis

**Market Positioning:**
- Price comparison
- Menu comparison
- Performance benchmarks
- Market share

---

## Related Guides

- [Menu Management Guide](./MENU_MANAGEMENT_GUIDE.md)
- [Location Management Guide](./LOCATION_MANAGEMENT_GUIDE.md)
- [Team Management Guide](./TEAM_MANAGEMENT_GUIDE.md)

---

**Last Updated**: November 2025
