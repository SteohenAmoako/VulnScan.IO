
import matplotlib.pyplot as plt
import numpy as np

# --- Sample Data ---
# This data simulates usage logs, showing the number of scans per hour over a 24-hour period.
# This pattern creates a "peak hours" effect in the morning and afternoon.
hours_of_day = np.arange(24)
scans_per_hour = np.array([
    2, 1, 1, 0, 1, 3, 5, 8, 15, 18, 25, 22, # Morning build-up and peak
    20, 28, 35, 31, 26, 18, 12, 9, 6, 4, 3, 2  # Afternoon peak and evening fall-off
])

# --- Create the Plot ---
# Set the style for a professional look
plt.style.use('seaborn-v0_8-whitegrid')
fig, ax = plt.subplots(figsize=(12, 7))

# Create the bar chart
bars = ax.bar(hours_of_day, scans_per_hour, 
              color='darkcyan', 
              alpha=0.7,
              edgecolor='black',
              linewidth=0.5)

# --- Labeling and Styling ---
# Set the title and axis labels from your documentation
ax.set_title('Usage Log Analytics: Frequency of Scans Over Time', fontsize=16, fontweight='bold', pad=20)
ax.set_xlabel('Hour of the Day', fontsize=12, labelpad=15)
ax.set_ylabel('Number of Scans', fontsize=12, labelpad=15)

# Customize grid and spines for a cleaner look
ax.grid(True, which='major', axis='y', linestyle='--', linewidth=0.7)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_visible(False)
ax.set_axisbelow(True) # Ensure grid is behind bars

# Customize x-axis ticks to be more readable (e.g., 00:00, 01:00)
ax.set_xticks(hours_of_day)
ax.set_xticklabels([f'{h:02d}:00' for h in hours_of_day], rotation=45, ha='right')

# Add a subtle background color
ax.set_facecolor('#f5f5f5')

# Ensure layout is tight to prevent labels from being cut off
plt.tight_layout()


# --- Save the Figure ---
# Save the graph to a file in the current directory
output_filename = 'figure_5_7_usage_analytics.png'
plt.savefig(output_filename, dpi=300, facecolor=fig.get_facecolor())

print(f"Graph successfully saved as '{output_filename}'")
