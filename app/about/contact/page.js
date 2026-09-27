function Contact() {
  return (
    <div className="page">
      <h1>Contact Me</h1>

      <p>
        If you would like to get in touch with me, please use the
        information below.
      </p>

      <h3>Email</h3>
      <p>sanjeev@example.com</p>

      <h3>Phone</h3>
      <p>+91 98765 43210</p>

      <h3>Location</h3>
      <p>India</p>

      <h2>Send a Message</h2>

      <form>
        <input type="text" placeholder="Enter your name" />
        <br /><br />

        <input type="email" placeholder="Enter your email" />
        <br /><br />

        <textarea
          placeholder="Enter your message"
          rows="5"
        ></textarea>
        <br /><br />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Contact;