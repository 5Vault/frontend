const ToBlob = async (file_id: string, key: string): Promise<string> => {
  const response = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/file/${file_id}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Api-Key": key || "",
            },
        }
    );
    
    if (!response.ok) {
        throw new Error("Failed to fetch file");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
};

export default ToBlob;