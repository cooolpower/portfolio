import { ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Section } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Paragraph } from "@/components/ui/typography";
import { parseHighlight } from "@/utils/parse-highlight";
import { PORTFOLIO_DATA_KO, PORTFOLIO_DATA_EN } from "@/constants/data";
import { useLanguage } from "@/components/ui/LanguageContext";
import { AchievementsList } from "@/components/ui/achievements-list";
import * as styles from "./portfolio-page.css";

export function PortfolioPage() {
  const { language, t } = useLanguage();
  const data = language === "ko" ? PORTFOLIO_DATA_KO : PORTFOLIO_DATA_EN;
  const { profile, careers, projects, skills } = data;

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactEmail) {
      setIsSent(true);
      setContactName("");
      setContactEmail("");
    }
  };

  useEffect(() => {
    if (isSent) {
      const timer = setTimeout(() => setIsSent(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isSent]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* About Section */}
        <Section id="about" className={styles.aboutSection}>
          <Paragraph className={styles.aboutText}>
            {parseHighlight(profile.aboutMe)}
          </Paragraph>
        </Section>

        {/* Experience Section */}
        <Section id="experience">
          <div>
            <h2 className={styles.sectionLabel}>{t("experience")}</h2>
            <div className={styles.experienceList}>
              {careers.map((career) => (
                <div key={career.company} className={styles.experienceRow}>
                  <div className={styles.expDate}>{career.period}</div>
                  <div>
                    <div className={styles.expTitleContainer}>
                      {career.link ? (
                        <a
                          href={career.link}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.expCompanyLink}
                        >
                          <h2 className={styles.expCompanyTitle}>
                            {career.company}
                          </h2>
                          <ExternalLink size={14} className={styles.expLinkIcon} />
                        </a>
                      ) : (
                        <h2 className={styles.expCompanyTitle}>
                          {career.company}
                        </h2>
                      )}
                      <h3 className={styles.expRoleTitle}>{career.role}</h3>
                    </div>
                    <p className={styles.expDescription}>
                      {parseHighlight(career.description)}
                    </p>
                    <AchievementsList
                      items={career.achievements}
                      groupLinks={career.groupLinks}
                    />
                    <div className={styles.expTechs}>
                      {career.skills.map((item) => (
                        <Badge key={item}>{item}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <a
              href={profile.resume}
              target="_blank"
              rel="noreferrer"
              className={styles.resumeLink}
            >
              {t("viewResume")}
            </a>
          </div>
        </Section>

        {/* Projects Section */}
        <Section id="projects">
          <div>
            <h2 className={styles.sectionLabel}>{t("projects")}</h2>
            <div className={styles.projectGrid}>
              {projects.map((project) => (
                <div key={project.id} className={styles.projectRow}>
                  <Card>
                    <CardHeader>
                      <div className={styles.projectCardWrapper}>
                        <div className={styles.projectTitleContainer}>
                          <CardTitle className={styles.projectTitle}>
                            {project.title}
                          </CardTitle>
                          <ExternalLink size={16} className={styles.linkIcon} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className={styles.projectDescription}>
                        {parseHighlight(project.summary)}
                      </p>
                      <div className={styles.projectTechs}>
                        {project.techStack.map((tech) => (
                          <Badge key={tech.name}>{tech.name}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Skills Section */}
        <Section id="skills">
          <div>
            <h2 className={styles.sectionLabel}>{t("skills")}</h2>
            <div className={styles.skillsContainer}>
              {skills.map((cat) => (
                <div key={cat.title} className={styles.skillCategory}>
                  <h3 className={styles.skillCategoryTitle}>{cat.title}</h3>
                  <div className={styles.skillBadgeList}>
                    {cat.skills.map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Contact Section */}
        <Section id="contact">
          <div>
            <h2 className={styles.sectionLabel}>{t("contact")}</h2>
            <form className={styles.contactForm} onSubmit={handleContactSubmit}>
              <div className={styles.formField}>
                <label className={styles.formLabel} htmlFor="contact-name">
                  {t("contactName")}
                </label>
                <Input
                  id="contact-name"
                  type="text"
                  placeholder={t("placeholderName")}
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel} htmlFor="contact-email">
                  {t("contactEmail")}
                </label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder={t("placeholderEmail")}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="primary">
                {t("sendMessage")}
              </Button>
              {isSent && (
                <span className={styles.successMessage}>
                  {t("successMessage")}
                </span>
              )}
            </form>
          </div>
        </Section>
      </div>
    </div>
  );
}
