import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';

export default function TabLink({ to, title, exact }) {
     const isActive = useRouteMatch({path: to, exact: exact});
     const className = isActive ? 'active' : '';

     return (
        <li role="presentation" className={className}>
            <Link to={to}>
                {title}
            </Link>
        </li>);
}

