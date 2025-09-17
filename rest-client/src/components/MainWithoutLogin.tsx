import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function MainWithoutLogin() {
  const { t } = useTranslation();
  return (
    <section className="MainWithoutLogin">
      {" "}
      <Link to={"/signin"}>{t("signin")}</Link>
      <Link to={"/signup"}>{t("signup")}</Link>
    </section>
  );
}
