import { IsEmail, IsNotEmpty, Max, Min, validate } from "class-validator";
interface ProjectType {
    title: string,
    description: string,
    people: number,
    id: string
}


enum TargetTypes {
    ACTIVE = "ACTIVE", PASSIVE = "PASSIVE"
}
interface DatasetData {
    target: TargetTypes,
    id: string
}




interface MyError {
    prop: string,
    description: string
}



if ("content" in document.createElement("template")) {
    const projectInput = <HTMLTemplateElement>document.getElementById("project-input")!;
    const app = document.getElementById("app")!;
    app.appendChild(projectInput.content)
    const form = document.getElementsByTagName("form")[0]!;
    form.id = "user-input"
    const title = <HTMLInputElement>document.getElementById("title")!;
    const description = <HTMLTextAreaElement>document.getElementById("description")!;
    const people = <HTMLInputElement>document.getElementById("people")!;

    class ProjectManager {
        private root = document.getElementById("project-list")! as HTMLTemplateElement;
        private template = document.getElementById("single-project")! as HTMLTemplateElement;
        private list: ProjectType[] = []
        static instance: ProjectManager;
        private constructor() { }
        static getInstance() {
            if (!ProjectManager.instance) {

                ProjectManager.instance = new ProjectManager()
                ProjectManager.instance.createList("Active List", "active-list")
                ProjectManager.instance.createList("Completed List", "completed-list")

            }
            return ProjectManager.instance
        }
        createList(title: string, id: string) {
            const clone = (this.root.content.cloneNode(true) as HTMLElement).firstElementChild! as HTMLUListElement;
            clone.querySelector("h2")!.textContent = title
            clone.addEventListener("dragover", (e: DragEvent) => {
                e.preventDefault()
            })
            clone.addEventListener("drop", (e: DragEvent) => {
                const target = e.currentTarget as HTMLElement;
                const isTargetActive = target.id == "active-list"
                const targetList = e.dataTransfer!.getData("target") as string
                const data = JSON.parse(targetList) as DatasetData;
                let targetParent: HTMLUListElement | undefined;

                if (data.target == TargetTypes.ACTIVE && isTargetActive) {
                    targetParent = document.getElementById("active-list") as HTMLUListElement

                } else if (data.target == TargetTypes.PASSIVE && !isTargetActive) {
                    targetParent = document.getElementById("completed-list") as HTMLUListElement

                }
                if (targetParent) {
                    const elem = document.getElementById(data.id)! as HTMLLIElement;
                    target.appendChild(elem)
                }


            })

            clone.id = id
            app.appendChild(clone);
        }


        createProject(project: ProjectType) {
            const { title, description, people, id } = project;
            const clone = (this.template.content.cloneNode(true) as HTMLElement).firstElementChild as HTMLElement
            clone.querySelector("h1")!.textContent = title;
            clone.id = id
            clone.querySelector("strong")!.textContent = `${people} contributors added`
            clone.querySelector("p")!.textContent = description;

            clone.addEventListener("dragstart", (e: DragEvent) => {
                const target = e.currentTarget as HTMLElement;
                const isActive = target.closest("section")!.id == "active-list"
                e.dataTransfer!.setData("target", JSON.stringify({ target: isActive ? TargetTypes.PASSIVE : TargetTypes.ACTIVE, id: target.id }));

            })
            this.list.push(project)

            const listRoot = document.getElementById("active-list")!.querySelector("ul")!
            listRoot.appendChild(clone)


        }

    }




    class Project implements ProjectType {
        @IsNotEmpty() @IsEmail()
        title: string;
        @IsNotEmpty()
        description: string;
        @IsNotEmpty() @Min(1) @Max(21)
        people: number;

        id: string
        constructor(title: string, description: string, people: number) {
            this.title = title
            this.description = description
            this.people = people
            this.id = Math.random().toString()
        }


        mount(): MyError[] | void {
            const template = ProjectManager.getInstance();
            template.createProject(this)
        }
    }


    form.addEventListener("submit", async (e: SubmitEvent) => {
        try {
            e.preventDefault();
            const project = new Project(title.value, description.value, +people.value)
            const errors = await validate(project);
            if (errors.length) {
                for (const err of errors) {
                    console.log(err)
                }
            } else {
                project.mount();

            }


        } catch (err) {
            console.log(err)
        }

    })

}

