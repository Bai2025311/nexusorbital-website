/**
 * NexusOrbital - 智能体系统数据
 * 基于8大智能体职责详解
 */

// 八大智能体基础数据
const agentsData = [
    {
        id: 'platform_builder',
        name: '平台搭建智能体',
        role: '技术基础设施与系统集成专家',
        expertise: ['技术架构设计', '工具选型', '系统开发', '压力测试', '持续部署'],
        icon: 'fa-layer-group',
        description: '负责构建技术基础设施与系统集成，使用Webflow+Cloudflare搭建官网，配置Discord机器人管理社区，集成GitHub Actions实现CI/CD。',
        workFlow: [
            { step: '技术架构设计', nextSteps: ['工具选型'] },
            { step: '工具选型', nextSteps: ['系统开发'] },
            { step: '系统开发', nextSteps: ['压力测试'] },
            { step: '压力测试', nextSteps: ['持续部署'] },
            { step: '持续部署', nextSteps: [] }
        ],
        workContent: [
            '使用Webflow+Cloudflare搭建官网',
            '配置Discord机器人管理社区',
            '集成GitHub Actions实现CI/CD'
        ],
        adminFeatures: [
            { id: 'tech_architecture', name: '技术架构设计', icon: 'fa-sitemap' },
            { id: 'tool_selection', name: '工具选型', icon: 'fa-tools' },
            { id: 'system_dev', name: '系统开发', icon: 'fa-code' },
            { id: 'stress_test', name: '压力测试', icon: 'fa-tachometer-alt' },
            { id: 'continuous_deploy', name: '持续部署', icon: 'fa-rocket' }
        ],
        userFeatures: [
            { id: 'website_builder', name: '网站构建助手', icon: 'fa-globe' },
            { id: 'tech_guide', name: '技术指南', icon: 'fa-book-reader' },
            { id: 'system_explore', name: '系统探索', icon: 'fa-compass' }
        ]
    },
    {
        id: 'content_generator',
        name: '内容生成智能体',
        role: '生态内容生产与知识管理专家',
        expertise: ['热点捕捉', 'AI创作', '多模态转换', '智能分发'],
        icon: 'fa-pen-fancy',
        description: '负责生态内容生产与知识管理，每日生成50+建筑概念图，自动撰写技术文档，制作短视频。',
        workFlow: [
            { step: '热点捕捉', nextSteps: ['AI创作'] },
            { step: 'AI创作', nextSteps: ['多模态转换'] },
            { step: '多模态转换', nextSteps: ['智能分发'] },
            { step: '智能分发', nextSteps: [] }
        ],
        workContent: [
            '每日生成50+建筑概念图（Stable Diffusion）',
            '自动撰写技术文档（GPT-4+NASA数据库）',
            '制作短视频（RunwayML）'
        ],
        adminFeatures: [
            { id: 'trend_capture', name: '热点捕捉', icon: 'fa-fire' },
            { id: 'ai_creation', name: 'AI创作', icon: 'fa-robot' },
            { id: 'multimodal', name: '多模态转换', icon: 'fa-exchange-alt' },
            { id: 'content_dist', name: '智能分发', icon: 'fa-share-alt' }
        ],
        userFeatures: [
            { id: 'concept_generator', name: '概念图生成器', icon: 'fa-image' },
            { id: 'doc_assistant', name: '文档助手', icon: 'fa-file-alt' },
            { id: 'video_creator', name: '视频创作器', icon: 'fa-video' }
        ]
    },
    {
        id: 'community_operator',
        name: '社区运营智能体',
        role: '用户生命周期管理与激励设计专家',
        expertise: ['新用户引导', '行为激励', '价值沉淀', '流失预警'],
        icon: 'fa-users',
        description: '负责用户生命周期管理与激励设计，发放星尘积分，运营「建造者等级」体系，自动调解社区冲突。',
        workFlow: [
            { step: '新用户引导', nextSteps: ['行为激励'] },
            { step: '行为激励', nextSteps: ['价值沉淀'] },
            { step: '价值沉淀', nextSteps: ['流失预警'] },
            { step: '流失预警', nextSteps: [] }
        ],
        workContent: [
            '发放星尘积分（1积分=¥0.1）',
            '运营「建造者等级」体系',
            '自动调解社区冲突'
        ],
        adminFeatures: [
            { id: 'user_guide', name: '新用户引导', icon: 'fa-user-plus' },
            { id: 'behavior_incentive', name: '行为激励', icon: 'fa-award' },
            { id: 'value_precipitation', name: '价值沉淀', icon: 'fa-gem' },
            { id: 'churn_warning', name: '流失预警', icon: 'fa-user-minus' }
        ],
        userFeatures: [
            { id: 'community_guide', name: '社区向导', icon: 'fa-map-signs' },
            { id: 'points_system', name: '积分系统', icon: 'fa-star' },
            { id: 'conflict_resolver', name: '冲突解决器', icon: 'fa-balance-scale' }
        ]
    },
    {
        id: 'crowdfunding_manager',
        name: '众筹管理智能体',
        role: '产品化与供应链打通专家',
        expertise: ['需求收集', '智能定价', '预售发布', '生产监控'],
        icon: 'fa-donate',
        description: '负责产品化与供应链打通，动态调整众筹目标，对接1688供应链API，自动生成物流追踪码。',
        workFlow: [
            { step: '需求收集', nextSteps: ['智能定价'] },
            { step: '智能定价', nextSteps: ['预售发布'] },
            { step: '预售发布', nextSteps: ['生产监控'] },
            { step: '生产监控', nextSteps: [] }
        ],
        workContent: [
            '动态调整众筹目标（根据社区热度）',
            '对接1688供应链API',
            '自动生成物流追踪码'
        ],
        adminFeatures: [
            { id: 'demand_collection', name: '需求收集', icon: 'fa-clipboard-list' },
            { id: 'smart_pricing', name: '智能定价', icon: 'fa-tag' },
            { id: 'presale', name: '预售发布', icon: 'fa-shopping-cart' },
            { id: 'production_monitor', name: '生产监控', icon: 'fa-industry' }
        ],
        userFeatures: [
            { id: 'project_supporter', name: '项目支持向导', icon: 'fa-hand-holding-usd' },
            { id: 'product_tracker', name: '产品追踪器', icon: 'fa-truck' },
            { id: 'demand_submitter', name: '需求提交器', icon: 'fa-lightbulb' }
        ]
    },
    {
        id: 'data_analyst',
        name: '数据分析智能体',
        role: '决策优化与风险预警专家',
        expertise: ['数据采集', '模式识别', '策略生成', '效果追踪'],
        icon: 'fa-chart-bar',
        description: '负责决策优化与风险预警，构建用户行为热力图，预测设计转化率，生成周度战略简报。',
        workFlow: [
            { step: '数据采集', nextSteps: ['模式识别'] },
            { step: '模式识别', nextSteps: ['策略生成'] },
            { step: '策略生成', nextSteps: ['效果追踪'] },
            { step: '效果追踪', nextSteps: [] }
        ],
        workContent: [
            '构建用户行为热力图',
            '预测设计转化率（误差率<8%）',
            '生成周度战略简报'
        ],
        adminFeatures: [
            { id: 'data_collection', name: '数据采集', icon: 'fa-database' },
            { id: 'pattern_recognition', name: '模式识别', icon: 'fa-brain' },
            { id: 'strategy_generation', name: '策略生成', icon: 'fa-chess' },
            { id: 'effect_tracking', name: '效果追踪', icon: 'fa-chart-line' }
        ],
        userFeatures: [
            { id: 'personal_analytics', name: '个人分析', icon: 'fa-user-chart' },
            { id: 'insight_generator', name: '洞察生成器', icon: 'fa-lightbulb' },
            { id: 'trend_analyzer', name: '趋势分析器', icon: 'fa-chart-pie' }
        ]
    },
    {
        id: 'legal_compliance',
        name: '法律合规智能体',
        role: '风险控制与协议管理专家',
        expertise: ['智能审查', '协议生成', '风险评级', '自动应对'],
        icon: 'fa-gavel',
        description: '负责风险控制与协议管理，动态生成多国合规协议，监测敏感内容，处理链上纠纷。',
        workFlow: [
            { step: '智能审查', nextSteps: ['协议生成'] },
            { step: '协议生成', nextSteps: ['风险评级'] },
            { step: '风险评级', nextSteps: ['自动应对'] },
            { step: '自动应对', nextSteps: [] }
        ],
        workContent: [
            '动态生成多国合规协议',
            '监测敏感内容（准确率99.3%）',
            '处理链上纠纷（DAO投票机制）'
        ],
        adminFeatures: [
            { id: 'intelligent_review', name: '智能审查', icon: 'fa-search' },
            { id: 'agreement_generation', name: '协议生成', icon: 'fa-file-contract' },
            { id: 'risk_rating', name: '风险评级', icon: 'fa-exclamation-triangle' },
            { id: 'auto_response', name: '自动应对', icon: 'fa-shield-alt' }
        ],
        userFeatures: [
            { id: 'legal_assistant', name: '法律助手', icon: 'fa-balance-scale' },
            { id: 'agreement_wizard', name: '协议向导', icon: 'fa-file-signature' },
            { id: 'dispute_resolver', name: '纠纷解决器', icon: 'fa-handshake' }
        ]
    },
    {
        id: 'user_growth',
        name: '用户增长智能体',
        role: '裂变传播与精准获客专家',
        expertise: ['种子用户筛选', '裂变活动设计', '渠道优化', 'LTV最大化'],
        icon: 'fa-user-plus',
        description: '负责裂变传播与精准获客，创建虚拟KOL矩阵，运营「邀请返现」金字塔，自动化A/B测试。',
        workFlow: [
            { step: '种子用户筛选', nextSteps: ['裂变活动设计'] },
            { step: '裂变活动设计', nextSteps: ['渠道优化'] },
            { step: '渠道优化', nextSteps: ['LTV最大化'] },
            { step: 'LTV最大化', nextSteps: [] }
        ],
        workContent: [
            '创建虚拟KOL矩阵（D-ID生成）',
            '运营「邀请返现」金字塔（L1返15%，L2返8%）',
            '自动化A/B测试（每日50组实验）'
        ],
        adminFeatures: [
            { id: 'seed_user_selection', name: '种子用户筛选', icon: 'fa-filter' },
            { id: 'fission_activity', name: '裂变活动设计', icon: 'fa-network-wired' },
            { id: 'channel_optimization', name: '渠道优化', icon: 'fa-route' },
            { id: 'ltv_maximize', name: 'LTV最大化', icon: 'fa-chart-line' }
        ],
        userFeatures: [
            { id: 'invitation_system', name: '邀请系统', icon: 'fa-user-friends' },
            { id: 'kol_simulator', name: 'KOL模拟器', icon: 'fa-user-tie' },
            { id: 'referral_tracker', name: '推荐追踪器', icon: 'fa-tree' }
        ]
    },
    {
        id: 'profit_engine',
        name: '盈利智能体',
        role: '现金流引擎与资本运作专家',
        expertise: ['收入识别', '成本优化', '利润分配', '资本放大'],
        icon: 'fa-coins',
        description: '负责现金流引擎与资本运作，动态调整抽成比例，操作数据资产证券化，管理流动性池。',
        workFlow: [
            { step: '收入识别', nextSteps: ['成本优化'] },
            { step: '成本优化', nextSteps: ['利润分配'] },
            { step: '利润分配', nextSteps: ['资本放大'] },
            { step: '资本放大', nextSteps: [] }
        ],
        workContent: [
            '动态调整抽成比例（5%-25%阶梯）',
            '操作数据资产证券化（Ocean Protocol）',
            '管理流动性池（USDT/ORB双币种）'
        ],
        adminFeatures: [
            { id: 'revenue_recognition', name: '收入识别', icon: 'fa-file-invoice-dollar' },
            { id: 'cost_optimization', name: '成本优化', icon: 'fa-cut' },
            { id: 'profit_distribution', name: '利润分配', icon: 'fa-hand-holding-usd' },
            { id: 'capital_amplification', name: '资本放大', icon: 'fa-chart-line' }
        ],
        userFeatures: [
            { id: 'earning_tracker', name: '收益追踪器', icon: 'fa-piggy-bank' },
            { id: 'asset_manager', name: '资产管理器', icon: 'fa-wallet' },
            { id: 'investment_advisor', name: '投资顾问', icon: 'fa-funnel-dollar' }
        ]
    }
];

// 系统模式：管理员模式(admin)和用户模式(user)
const SystemModes = {
    ADMIN: 'admin',
    USER: 'user'
};

// 导出数据供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        agentsData,
        SystemModes
    };
}
