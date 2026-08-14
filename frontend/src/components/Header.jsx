import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="site-header">
      <div>
        <div className="site-title">
          <span className="mark" />
          <Link to="/">Ledger</Link>
        </div>
        <div className="site-tagline">a plain little journal</div>
      </div>
      <div className="header-actions">
        <Link to="/new">+ New Entry</Link>
      </div>
    </header>
  );
}
