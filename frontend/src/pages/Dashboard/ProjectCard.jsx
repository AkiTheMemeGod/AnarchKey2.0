import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, ArrowRight } from 'lucide-react';
import Card from '../../components/ui/Card';
import styles from './ProjectCard.module.css';

const ProjectCard = ({ project }) => {
    return (
        <Link to={`/project/${project._id}`} className={styles.link}>
            <Card className={styles.card}>
                <div className={styles.icon}>
                    <Folder size={24} />
                </div>
                <div className={styles.content}>
                    <h3 className={styles.name}>{project.project_name}</h3>
                    <p className={styles.id}>ID: {project._id.substring(0, 8)}...</p>
                </div>
                <div className={styles.footer}>
                    <div className={styles.status}>Active</div>
                    <div className={styles.arrow}>
                        <ArrowRight size={20} />
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default ProjectCard;
