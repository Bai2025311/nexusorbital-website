// Agent System for CosmicWeave Space Colonization Community
// This coordinates the 8 specialized AI agents that work together

import languageSwitcher from '../lang/languageSwitcher.js';

class Agent {
  constructor(id, name, role, expertise, icon) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.expertise = expertise;
    this.icon = icon;
    this.active = false;
    this.tasks = [];
    this.completedTasks = [];
    this.collaboratingWith = [];
  }

  activate() {
    this.active = true;
    return {
      status: 'activated',
      message: `${this.name} is now online and ready to assist.`
    };
  }

  deactivate() {
    this.active = false;
    return {
      status: 'deactivated',
      message: `${this.name} has been put on standby.`
    };
  }

  assignTask(task) {
    if (!this.active) {
      return {
        status: 'error',
        message: `${this.name} is currently inactive. Please activate first.`
      };
    }
    
    this.tasks.push(task);
    return {
      status: 'assigned',
      message: `Task assigned to ${this.name}: ${task.title}`
    };
  }

  completeTask(taskId) {
    if (!this.active) {
      return {
        status: 'error',
        message: `${this.name} is currently inactive. Please activate first.`
      };
    }
    
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return {
        status: 'error',
        message: `Task with ID ${taskId} not found for ${this.name}.`
      };
    }
    
    const completedTask = this.tasks.splice(taskIndex, 1)[0];
    completedTask.completedAt = new Date();
    this.completedTasks.push(completedTask);
    
    return {
      status: 'completed',
      message: `${this.name} has completed task: ${completedTask.title}`,
      task: completedTask
    };
  }

  collaborateWith(agentId) {
    if (!this.collaboratingWith.includes(agentId)) {
      this.collaboratingWith.push(agentId);
      return {
        status: 'collaborating',
        message: `${this.name} is now collaborating with Agent #${agentId}.`
      };
    }
    
    return {
      status: 'already_collaborating',
      message: `${this.name} is already collaborating with Agent #${agentId}.`
    };
  }

  getStatus() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      active: this.active,
      tasksCount: this.tasks.length,
      completedTasksCount: this.completedTasks.length,
      collaboratingWith: this.collaboratingWith
    };
  }
}

class AgentSystem {
  constructor() {
    this.agents = [
      new Agent(1, 'Explorer', 'Terrain Mapping', ['Geology', 'Cartography', 'Resource Detection'], 'fas fa-mountain'),
      new Agent(2, 'Architect', 'Habitat Design', ['Structural Engineering', 'Space Efficiency', 'Environmental Control'], 'fas fa-drafting-compass'),
      new Agent(3, 'Scientist', 'Research & Development', ['Physics', 'Chemistry', 'Biology', 'Materials Science'], 'fas fa-flask'),
      new Agent(4, 'Engineer', 'Infrastructure', ['Power Systems', 'Water Systems', 'Communication Networks'], 'fas fa-cogs'),
      new Agent(5, 'Medic', 'Healthcare', ['Medicine', 'Psychology', 'Radiation Protection'], 'fas fa-heartbeat'),
      new Agent(6, 'Botanist', 'Food Production', ['Hydroponics', 'Crop Optimization', 'Nutrition'], 'fas fa-leaf'),
      new Agent(7, 'Logistics', 'Resource Management', ['Supply Chain', 'Inventory Control', 'Transportation'], 'fas fa-boxes'),
      new Agent(8, 'Community', 'Social Systems', ['Governance', 'Education', 'Recreation', 'Conflict Resolution'], 'fas fa-users')
    ];
    
    this.activeCollaborationProjects = [];
    this.systemStatus = 'standby'; // 'standby', 'active', 'busy'
  }

  getAgent(id) {
    return this.agents.find(agent => agent.id === id);
  }

  activateAll() {
    const results = [];
    this.agents.forEach(agent => {
      results.push(agent.activate());
    });
    this.systemStatus = 'active';
    
    // Create initial collaboration between all agents
    this.initiateSystemwideCollaboration();
    
    return {
      status: 'all_activated',
      results,
      message: 'All 8 AI agents are now active and collaborating.'
    };
  }

  deactivateAll() {
    const results = [];
    this.agents.forEach(agent => {
      results.push(agent.deactivate());
    });
    this.systemStatus = 'standby';
    
    // Clear all collaborations
    this.activeCollaborationProjects = [];
    
    return {
      status: 'all_deactivated',
      results,
      message: 'All AI agents have been deactivated.'
    };
  }

  initiateSystemwideCollaboration() {
    // Create a collaboration network where all agents collaborate with each other
    this.agents.forEach(agent => {
      this.agents.forEach(collaborator => {
        if (agent.id !== collaborator.id) {
          agent.collaborateWith(collaborator.id);
        }
      });
    });
    
    // Create a system-wide project
    const projectId = Date.now();
    this.activeCollaborationProjects.push({
      id: projectId,
      name: 'Mars Base Development',
      startedAt: new Date(),
      participants: this.agents.map(agent => agent.id),
      status: 'active',
      progress: 0,
      milestones: [
        { id: 1, title: 'Site Selection', complete: false, assignedTo: 1 },
        { id: 2, title: 'Base Layout Design', complete: false, assignedTo: 2 },
        { id: 3, title: 'Material Testing', complete: false, assignedTo: 3 },
        { id: 4, title: 'Power System Design', complete: false, assignedTo: 4 },
        { id: 5, title: 'Medical Bay Planning', complete: false, assignedTo: 5 },
        { id: 6, title: 'Food Production Design', complete: false, assignedTo: 6 },
        { id: 7, title: 'Supply Chain Planning', complete: false, assignedTo: 7 },
        { id: 8, title: 'Community Structure Development', complete: false, assignedTo: 8 }
      ]
    });
    
    return {
      status: 'collaboration_initiated',
      projectId,
      message: 'System-wide collaboration initiated among all agents.'
    };
  }

  getSystemStatus() {
    return {
      status: this.systemStatus,
      activeAgents: this.agents.filter(agent => agent.active).length,
      totalAgents: this.agents.length,
      activeProjects: this.activeCollaborationProjects.length,
      agents: this.agents.map(agent => agent.getStatus())
    };
  }

  getAgentRecommendation(query) {
    // Simple recommendation engine that suggests which agent would be best for a user's query
    const keywords = {
      explorer: ['terrain', 'geography', 'location', 'map', 'surface', 'land', 'explore'],
      architect: ['design', 'building', 'structure', 'habitat', 'layout', 'construction'],
      scientist: ['research', 'experiment', 'study', 'analysis', 'data', 'theory', 'test'],
      engineer: ['power', 'electricity', 'water', 'communication', 'system', 'technology'],
      medic: ['health', 'medical', 'disease', 'treatment', 'psychology', 'wellbeing'],
      botanist: ['plant', 'food', 'farm', 'crop', 'garden', 'agriculture', 'grow'],
      logistics: ['resource', 'supply', 'transport', 'inventory', 'equipment', 'storage'],
      community: ['people', 'governance', 'rule', 'social', 'education', 'recreation']
    };
    
    const scores = this.agents.map(agent => {
      const lowerRole = agent.role.toLowerCase();
      const agentKeywords = keywords[agent.name.toLowerCase()];
      let score = 0;
      
      if (agentKeywords) {
        agentKeywords.forEach(keyword => {
          if (query.toLowerCase().includes(keyword)) {
            score += 1;
          }
        });
      }
      
      // Also check expertise areas
      agent.expertise.forEach(area => {
        if (query.toLowerCase().includes(area.toLowerCase())) {
          score += 2; // Higher weight for specific expertise match
        }
      });
      
      return { agent, score };
    });
    
    // Sort by score and return the top agent
    scores.sort((a, b) => b.score - a.score);
    return scores[0].agent;
  }

  // Localization support
  updateAgentTranslations() {
    document.addEventListener('languageChanged', (event) => {
      const lang = event.detail.language;
      
      // Update agent displays with appropriate language
      this.agents.forEach(agent => {
        const agentElement = document.querySelector(`.agent-card[data-agent-id="${agent.id}"]`);
        if (agentElement) {
          const nameElement = agentElement.querySelector('.agent-name');
          const roleElement = agentElement.querySelector('.agent-role');
          
          if (nameElement) {
            nameElement.textContent = languageSwitcher.getTranslation(`agent_${agent.name.toLowerCase()}`);
          }
          
          if (roleElement) {
            roleElement.textContent = languageSwitcher.getTranslation(`agent_${agent.name.toLowerCase()}_desc`);
          }
        }
      });
    });
  }
}

// Create and export a singleton instance
const agentSystem = new AgentSystem();
export default agentSystem;
