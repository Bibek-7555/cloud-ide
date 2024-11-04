import React from "react";

interface FileTreeNodeProps {
    filename: string,
    nodes: string | any
}

function FileTreeNode({filename, nodes}: FileTreeNodeProps){
    return (
        <div className="ml-3">
            <span className={nodes ? "text-blue-500 font-bold" : "text-gray-700"}>
                {filename}
            </span>
            {nodes && 
                (<ul>
                    {Object.keys(nodes).map((child) => (
                        <li key={child}>
                            <FileTreeNode filename={child} nodes={nodes[child]} />
                        </li>
                    ))}
                </ul>)
            }
        </div>
    )
}

interface FileTree {
    tree: string |object | any
}

function FileTree({tree}: FileTree): JSX.Element {
    return <FileTreeNode filename= "/" nodes={tree} />
}

export default FileTree;