import React, { useEffect, useState } from "react";

interface SimilarityData {
  inputName1: string;
  inputName2: string;
  similarity: number;
}

const SimilarityGrid: React.FC = () => {
  const [data, setData] = useState<SimilarityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/text-similarities");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result: SimilarityData[] = await response.json();

        // Sort the data as per requirements:
        const sortedData = result.sort((a, b) => {
          if (a.inputName1 === b.inputName1) {
            return b.similarity - a.similarity; // Sort by similarity in descending order
          }
          return a.inputName1.localeCompare(b.inputName1); // Sort by inputName1 alphabetically
        });

        setData(sortedData);
      } catch (error) {
        console.error("Error fetching similarity data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Text Similarities</h1>
      <div style={{ overflowY: "auto", maxHeight: "700px", border: "1px solid #ccc" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Input Name 1</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Input Name 2</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Similarity</th>
            </tr>
          </thead>
          <tbody>
            {data.map(({ inputName1, inputName2, similarity }, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{inputName1}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{inputName2}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{similarity.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimilarityGrid;
