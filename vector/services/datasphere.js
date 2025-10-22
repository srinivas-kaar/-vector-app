// services/datasphere.js
export async function getDatasphereData() {
  const response = await fetch('/api/datasphere/opportunities'); 
  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }

  return await response.json();
}