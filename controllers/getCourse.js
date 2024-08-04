// getCourseName and getCourseDate will help personalise the notifications and determine when to send notification

export async function getCourseDetails() {
    try {
      const response = await fetch('https://66a8ceb4e40d3aa6ff59818e.mockapi.io/api/notification/push');
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