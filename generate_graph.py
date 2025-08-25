
import matplotlib.pyplot as plt
import numpy as np

# --- Sample Data ---
# This data simulates the results you would get from running the k6 load test
# at different user levels. Replace this with your actual data.
concurrent_users = np.array([5, 10, 15, 20, 25, 30])
# Average response times in milliseconds (ms)
avg_response_time_ms = np.array([4530, 5120, 5950, 7100, 8350, 9800])

# --- Create the Plot ---
# Set the style for a professional look
plt.style.use('seaborn-v0_8-whitegrid')
fig, ax = plt.subplots(figsize=(10, 6))

# Plot the actual data points as a scatter plot
ax.scatter(concurrent_users, avg_response_time_ms, 
           color='royalblue', label='Actual Average Response Time',
           zorder=5, s=80)

# Plot the main line connecting the data points
ax.plot(concurrent_users, avg_response_time_ms, 
        color='royalblue', alpha=0.7, linestyle='--')

# --- Calculate and Plot the Trendline ---
# Perform a linear fit (degree 1 polynomial)
z = np.polyfit(concurrent_users, avg_response_time_ms, 1)
p = np.poly1d(z)

# Plot the trendline
ax.plot(concurrent_users, p(concurrent_users), 
        color="crimson", linewidth=2, linestyle="-", 
        label="Performance Trendline", zorder=4)


# --- Labeling and Styling ---
# Set the title and axis labels from your documentation
ax.set_title('Average Response Time vs. Concurrent Users', fontsize=16, fontweight='bold', pad=20)
ax.set_xlabel('Number of Concurrent Users', fontsize=12, labelpad=15)
ax.set_ylabel('Average Response Time (ms)', fontsize=12, labelpad=15)

# Customize grid and spines
ax.grid(True, which='both', linestyle='--', linewidth=0.5)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

# Add a legend to explain the lines
ax.legend(fontsize=10)

# Set ticks to be integers
ax.xaxis.set_major_locator(plt.MaxNLocator(integer=True))

# Ensure layout is tight
plt.tight_layout()


# --- Save the Figure ---
# Save the graph to a file in the current directory
output_filename = 'figure_5_4_performance_graph.png'
plt.savefig(output_filename, dpi=300)

print(f"Graph successfully saved as '{output_filename}'")
