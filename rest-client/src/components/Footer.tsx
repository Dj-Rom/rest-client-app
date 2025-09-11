import {Link} from "react-router-dom";

export default function Footer() {
  return (
    <footer className="p-4 text-center text-sm text-gray-500">
        ©  <Link to={"https://github.com/Dj-Rom"}>GitHub</Link> 2025 {" "}<Link to={"https://rs.school/courses/reactjs"}><img width={10} src={"https://images.ctfassets.net/12phxmr4hjo6/5gsAustpJN1GgYERWk8Hth/2df7c970259f0e01a1a0f567e859bc65/react.svg"} alt={"logo react course RS School"}/>React Course Rs</Link>
    </footer>
  );
}
