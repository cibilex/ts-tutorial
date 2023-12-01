var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ValidationKey;
(function (ValidationKey) {
    ValidationKey[ValidationKey["REQUIRED"] = 0] = "REQUIRED";
    ValidationKey[ValidationKey["MIN"] = 1] = "MIN";
    ValidationKey[ValidationKey["MAX"] = 2] = "MAX";
})(ValidationKey || (ValidationKey = {}));
var TargetTypes;
(function (TargetTypes) {
    TargetTypes["ACTIVE"] = "ACTIVE";
    TargetTypes["PASSIVE"] = "PASSIVE";
})(TargetTypes || (TargetTypes = {}));
const validations = {};
function addValidation(target, key, step) {
    const targetName = target.constructor.name;
    if (!validations[targetName])
        validations[targetName] = { ...validations[targetName], [key]: [step] };
    else if (!validations[targetName][key])
        validations[targetName][key] = [step];
    else {
        validations[targetName][key].push(step);
    }
}
function Required(target, key) {
    addValidation(target, key, {
        prop: ValidationKey.REQUIRED
    });
}
function MinValue(min) {
    return function (target, key) {
        addValidation(target, key, {
            prop: ValidationKey.MIN,
            param: min
        });
    };
}
function MaxValue(max) {
    return function (target, key) {
        addValidation(target, key, {
            prop: ValidationKey.MAX,
            param: max
        });
    };
}
function Validate(target, _eventName, descriptor) {
    const newDescriptor = {
        get() {
            const results = [];
            const currentValidations = validations[target.constructor.name];
            for (const key in currentValidations) {
                for (const step of currentValidations[key]) {
                    switch (step.prop) {
                        case ValidationKey.REQUIRED:
                            if (!this[key])
                                results.push({
                                    "description": "Please enter a value",
                                    "prop": key
                                });
                            break;
                        case ValidationKey.MIN:
                            if (this[key] < step.prop)
                                results.push({
                                    "description": `${key} must be greater than ${step.param}`,
                                    "prop": key
                                });
                            break;
                        case ValidationKey.MAX:
                            if (this[key] > step.prop)
                                results.push({
                                    "description": `${key} must be less than ${step.param}`,
                                    "prop": key
                                });
                            break;
                    }
                }
            }
            return results.length ? () => results : descriptor.value;
        },
    };
    return newDescriptor;
}
if ("content" in document.createElement("template")) {
    const projectInput = document.getElementById("project-input");
    const app = document.getElementById("app");
    app.appendChild(projectInput.content);
    const form = document.getElementsByTagName("form")[0];
    form.id = "user-input";
    const title = document.getElementById("title");
    const description = document.getElementById("description");
    const people = document.getElementById("people");
    class ProjectManager {
        root = document.getElementById("project-list");
        template = document.getElementById("single-project");
        list = [];
        static instance;
        constructor() { }
        static getInstance() {
            if (!ProjectManager.instance) {
                ProjectManager.instance = new ProjectManager();
                ProjectManager.instance.createList("Active List", "active-list");
                ProjectManager.instance.createList("Completed List", "completed-list");
            }
            return ProjectManager.instance;
        }
        createList(title, id) {
            const clone = this.root.content.cloneNode(true).firstElementChild;
            clone.querySelector("h2").textContent = title;
            clone.addEventListener("dragover", (e) => {
                e.preventDefault();
            });
            clone.addEventListener("drop", (e) => {
                const target = e.currentTarget;
                const isTargetActive = target.id == "active-list";
                const targetList = e.dataTransfer.getData("target");
                const data = JSON.parse(targetList);
                const parent = target.parentElement;
                let targetParent;
                if (data.target == TargetTypes.ACTIVE && isTargetActive) {
                    targetParent = document.getElementById("active-list");
                }
                else if (data.target == TargetTypes.PASSIVE && !isTargetActive) {
                    targetParent = document.getElementById("completed-list");
                }
                if (targetParent) {
                    const elem = document.getElementById(data.id);
                    target.appendChild(elem);
                }
            });
            clone.id = id;
            app.appendChild(clone);
        }
        createProject(project) {
            const { title, description, people, id } = project;
            const clone = this.template.content.cloneNode(true).firstElementChild;
            clone.querySelector("h1").textContent = title;
            clone.id = id;
            clone.querySelector("strong").textContent = `${people} contributors added`;
            clone.querySelector("p").textContent = description;
            clone.addEventListener("dragstart", (e) => {
                const target = e.currentTarget;
                const isActive = target.closest("section").id == "active-list";
                e.dataTransfer.setData("target", JSON.stringify({ target: isActive ? TargetTypes.PASSIVE : TargetTypes.ACTIVE, id: target.id }));
            });
            this.list.push(project);
            const listRoot = document.getElementById("active-list").querySelector("ul");
            listRoot.appendChild(clone);
        }
    }
    class Project {
        title;
        description;
        people;
        id;
        constructor(title, description, people) {
            this.title = title;
            this.description = description;
            this.people = people;
            this.id = Math.random().toString();
        }
        mount() {
            const template = ProjectManager.getInstance();
            template.createProject(this);
        }
    }
    __decorate([
        Required
    ], Project.prototype, "title", void 0);
    __decorate([
        Required
    ], Project.prototype, "description", void 0);
    __decorate([
        Required,
        MinValue(1),
        MaxValue(20)
    ], Project.prototype, "people", void 0);
    __decorate([
        Validate
    ], Project.prototype, "mount", null);
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const project = new Project(title.value, description.value, +people.value);
        const result = project.mount();
        if (result) {
            for (const message of result) {
                alert(message.description + " " + message.prop);
            }
        }
    });
}
export {};
//# sourceMappingURL=app.js.map