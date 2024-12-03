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
        setData(result);
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
      <table>
        <thead>
          <tr>
            <th>Input Name 1</th>
            <th>Input Name 2</th>
            <th>Similarity</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ inputName1, inputName2, similarity }, index) => (
            <tr key={index}>
              <td>{inputName1}</td>
              <td>{inputName2}</td>
              <td>{similarity.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SimilarityGrid;
