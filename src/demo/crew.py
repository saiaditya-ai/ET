import os
from typing import List

from crewai import Agent, Crew, Process, Task
from crewai.agents.agent_builder.base_agent import BaseAgent
from crewai.project import CrewBase, agent, crew, task
from pydantic import BaseModel


def _resolve_llm() -> str:
    return (
        os.getenv("MEDICAL_CODING_MODEL")
        or os.getenv("MODEL")
        or "groq/llama-3.3-70b-versatile"
    )

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
    agents: List[BaseAgent]
    tasks: List[Task]

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def clinical_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["clinical_agent"],  # type: ignore[index]
            llm=_resolve_llm(),
            inject_date=True,
            verbose=True,
        )

    @agent
    def coding_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["coding_agent"],  # type: ignore[index]
            llm=_resolve_llm(),
            inject_date=True,
            verbose=True,
        )

    @agent
    def validation_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["validation_agent"],  # type: ignore[index]
            llm=_resolve_llm(),
            inject_date=True,
            verbose=True,
        )

    @agent
    def audit_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["audit_agent"],  # type: ignore[index]
            llm=_resolve_llm(),
            inject_date=True,
            verbose=True,
        )

    @task
    def extract_task(self) -> Task:
        return Task(
            config=self.tasks_config["extract_task"],  # type: ignore[index]
        )

    @task
    def coding_task(self) -> Task:
        return Task(
            config=self.tasks_config["coding_task"],  # type: ignore[index]
        )

    @task
    def validation_task(self) -> Task:
        return Task(
            config=self.tasks_config["validation_task"],  # type: ignore[index]
        )

    @task
    def audit_task(self) -> Task:
        return Task(
            config=self.tasks_config["audit_task"],  # type: ignore[index]
            output_pydantic=MedicalCodingResult,
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )
