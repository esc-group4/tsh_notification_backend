// getCourseName and getCourseDate will help personalise the notifications and determine when to send notification

export async function getCourseDetails() {
    try {
      const response = await fetch('http://localhost:8080/notification');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching course schedule:', error);
      return null;
    }
  };