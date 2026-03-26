from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from pydantic import BaseModel
from typing import List

class CodeItem(BaseModel):
    code: str
    description: str
    confidence: float

class AuditItem(BaseModel):
    step: int
    agent: str
    action: str
    duration: str

class MedicalCodingResult(BaseModel):
    icd10_codes: List[CodeItem]
    cpt_codes: List[CodeItem]
    confidence: float
    reasoning: List[str]
    audit_trail: List[AuditItem]

@CrewBase
class MedicalCrew():

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def clinical_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["clinical_agent"],
            llm="groq/llama-3.3-70b-versatile",
            verbose=True
        )

    @agent
    def coding_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["coding_agent"],
            llm="groq/llama-3.3-70b-versatile",
            verbose=True
        )

    @agent
    def validation_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["validation_agent"],
            llm="groq/llama-3.3-70b-versatile",
            verbose=True
        )

    @agent
    def audit_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["audit_agent"],
            llm="groq/llama-3.3-70b-versatile",
            verbose=True
        )

    @task
    def extract_task(self) -> Task:
        return Task(
            config=self.tasks_config["extract_task"]
        )

    @task
    def coding_task(self) -> Task:
        return Task(
            config=self.tasks_config["coding_task"]
        )

    @task
    def validation_task(self) -> Task:
        return Task(
            config=self.tasks_config["validation_task"]
        )

    @task
    def audit_task(self) -> Task:
        return Task(
            config=self.tasks_config["audit_task"],
            output_pydantic=MedicalCodingResult
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True
        )
