const GoogleMap = ({ data }: any) => {
  // if (!data.googleMapLink) return null;
  return (
    <div>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2848.796238177982!2d26.09426151534455!3d44.4373417791023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b1ff4420f18839%3A0x90c7f45c899b844!2sBoarder&#39;s!5e0!3m2!1sen!2sro!4v1536927448356"
        width="100%"
        height="450"
        style={{ border: 0 }}
        allowFullScreen={true}
      ></iframe>
    </div>
  );
};

export default GoogleMap;
