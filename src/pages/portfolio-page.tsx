import { ExternalLink, Github, Mail } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Container, Section } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Paragraph, Subtitle, Title } from "@/components/ui/typography";
import { PORTFOLIO_DATA } from "@/constants/data";
import * as styles from "./portfolio-page.css";

export function PortfolioPage() {
  const { profile, careers, projects, skills } = PORTFOLIO_DATA;
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactEmail) {
      setIsSent(true);
      setContactName("");
      setContactEmail("");
      setTimeout(() => setIsSent(false), 3000);
    }
  };

  return (
    <Container>
      <div className={styles.container}>
        {/* Home Section */}
        <Section id="home">
          <header className={styles.header}>
            <div>
              <Title>{profile.name}</Title>
              <Subtitle>{profile.role}</Subtitle>
              <Paragraph>{profile.bio}</Paragraph>
            </div>
            <div className={styles.links}>
              <a href={profile.github} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm">
                  <Github size={16} style={{ marginRight: "8px" }} />
                  GitHub
                </Button>
              </a>
              <a href={`mailto:${profile.email}`}>
                <Button variant="outline" size="sm">
                  <Mail size={16} style={{ marginRight: "8px" }} />
                  Email
                </Button>
              </a>
            </div>
          </header>
        </Section>

        {/* About / Work Experience Section */}
        <Section id="about">
          <h2 className={styles.sectionTitle}>Work Experience</h2>
          {careers.map((career) => (
            <div key={career.company} className={styles.careerItem}>
              <div className={styles.careerHeader}>
                <span className={styles.companyName}>
                  {career.company} - {career.role}
                </span>
                <span className={styles.careerPeriod}>{career.period}</span>
              </div>
              <Paragraph>{career.description}</Paragraph>
              <ul className={styles.careerList}>
                {career.achievements.map((achievement) => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        {/* Projects Section */}
        <Section id="projects">
          <h2 className={styles.sectionTitle}>Featured Projects</h2>
          <div className={styles.projectGrid}>
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={styles.projectDetails}
                    style={{ marginBottom: "16px" }}
                  >
                    <Paragraph>{project.summary}</Paragraph>
                  </div>
                  <div className={styles.projectTechs}>
                    {project.techStack.map((tech) => (
                      <Badge key={tech.name}>{tech.name}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    View Details
                  </Button>
                  {project.links?.github && (
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="ghost" size="sm">
                        <ExternalLink
                          size={14}
                          style={{ marginRight: "4px" }}
                        />
                        Code
                      </Button>
                    </a>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Project Detail Modal/View Area */}
          {activeProject && (
            <div style={{ marginTop: "24px" }}>
              <Card>
                <CardHeader>
                  <div className={styles.projectHeader}>
                    <CardTitle>{activeProject.title} Details</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProjectId(null)}
                    >
                      Close Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={styles.detailContainer}>
                    <div>
                      <span className={styles.detailLabel}>Role: </span>
                      <span style={{ color: "#a1a1aa" }}>
                        {activeProject.role} ({activeProject.period.start} -{" "}
                        {activeProject.period.end})
                      </span>
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      <h4
                        className={styles.detailLabel}
                        style={{ marginBottom: "8px" }}
                      >
                        Troubleshooting & Architecture
                      </h4>
                      <div className={styles.troubleBlock}>
                        {activeProject.troubleshooting.map((t) => (
                          <div
                            key={t.problem}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <div>
                              <strong style={{ color: "#fafafa" }}>
                                Problem:{" "}
                              </strong>
                              <span style={{ color: "#a1a1aa" }}>
                                {t.problem}
                              </span>
                            </div>
                            <div>
                              <strong style={{ color: "#fafafa" }}>
                                Solution:{" "}
                              </strong>
                              <span style={{ color: "#a1a1aa" }}>
                                {t.solution}
                              </span>
                            </div>
                            <div>
                              <strong style={{ color: "#fafafa" }}>
                                Impact:{" "}
                              </strong>
                              <span style={{ color: "#a1a1aa" }}>
                                {t.impact}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      <h4
                        className={styles.detailLabel}
                        style={{ marginBottom: "8px" }}
                      >
                        Performance Metrics
                      </h4>
                      <div style={{ display: "flex", gap: "16px" }}>
                        {activeProject.metrics.map((m) => (
                          <div
                            key={m.label}
                            style={{
                              backgroundColor: "#27272a",
                              padding: "12px",
                              borderRadius: "6px",
                              flex: 1,
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                color: "#fafafa",
                              }}
                            >
                              {m.value}
                            </div>
                            <div
                              style={{ fontSize: "0.75rem", color: "#a1a1aa" }}
                            >
                              {m.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </Section>

        {/* Skills Section */}
        <Section id="skills">
          <h2 className={styles.sectionTitle}>Skills & Competencies</h2>
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
        </Section>

        {/* Contact Section */}
        <Section id="contact">
          <h2 className={styles.sectionTitle}>Contact</h2>
          <Paragraph>
            프로젝트 의뢰나 기술 파트너십, 채용 관련 등 자유롭게 연락주세요.
          </Paragraph>
          <form className={styles.contactForm} onSubmit={handleContactSubmit}>
            <Input
              type="text"
              placeholder="Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email Address"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="primary">
              Send Message
            </Button>
            {isSent && (
              <span
                style={{
                  color: "#10b981",
                  fontSize: "0.875rem",
                  marginTop: "8px",
                }}
              >
                Success! Your contact info has been simulated.
              </span>
            )}
          </form>
        </Section>
      </div>
    </Container>
  );
}
